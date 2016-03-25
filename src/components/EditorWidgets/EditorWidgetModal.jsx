import React, {PropTypes} from 'react';
import Radium from 'radium';
import {parsePluginString} from 'utils/parsePlugins';

// import {globalMessages} from 'utils/globalMessages';
// import {FormattedMessage} from 'react-intl';

import Plugins from 'components/EditorPlugins/index.js';
import InputFields from '../EditorPluginFields/index.js';
import MurmurHash from 'murmurhash';
import Portal from 'react-portal';
import {throttle, delay} from 'lodash';

let styles = {};

const EditorWidgetModal = React.createClass({
	propTypes: {
		activeFocus: PropTypes.string,
		codeMirrorChange: PropTypes.object,
		assets: PropTypes.array,
		references: PropTypes.object,
		selections: PropTypes.object,
		isLivePreview: PropTypes.bool,
		cm: PropTypes.object,
	},

	getDefaultProps: function() {
		return {
			activeFocus: '',
			codeMirrorChange: {}
		};
	},

	getInitialState() {
		this.popupInputFields = {};
		this.fromIndex = null;
		this.toIndex = null;
		this.onInputFieldChange = throttle(this._onInputFieldChange, 250);
		return {
			popupVisible: false,
			initialString: '',
			activeLine: undefined,
			activeChar: undefined,
			activeToken: null,
			pluginType: '',
			assets: [],
			references: [],
			selections: [],
		};
	},

	componentDidMount() {
		// document.documentElement.addEventListener('click', this.onPluginClick);
		document.documentElement.addEventListener('keydown', this.onpluginKeyPress);

	},
	onpluginKeyPress(evt) {
		if (evt.keyCode === 13 && this.state.popupVisible) {
			if (document.activeElement === document.body) {
				this.onPluginSave();
			}
		}
	},
	componentWillReceiveProps(nextProps) {

		// If a re-render causes this component to receive new props, but the props haven't changed, return.
		if (this.props.codeMirrorChange === nextProps.codeMirrorChange
			&& this.props.assets === nextProps.assets
			&& this.props.references === nextProps.references
			&& this.props.selections === nextProps.selections) {
			return null;
		}

		// If the change comes from another user
		if (this.props.codeMirrorChange !== nextProps.codeMirrorChange
			&& this.state.popupVisible === true
			&& nextProps.codeMirrorChange.origin
			&& (nextProps.codeMirrorChange.origin.indexOf('cmrt-') !== -1 || nextProps.codeMirrorChange.origin === 'RTCMADAPTER')) {
			this.updateToken({activeLine: this.state.activeLine, activeChar: this.state.activeChar, isUpdate: true});
		}

		const references = (nextProps.references) ? Object.values(nextProps.references) : [];
		const selections = (nextProps.selections) ? Object.values(nextProps.selections) : [];

		this.setState({references: references, aselections: selections});

		return true;
	},

	componentWillUnmount() {
		// document.documentElement.removeEventListener('click', this.onPluginClick);
		document.documentElement.removeEventListener('keydown', this.onpluginKeyPress);
	},

	getActiveCodemirrorInstance: function() {
		return this.props.cm;
		/*
		const cm = this.props.activeFocus === ''
				? document.getElementById('codemirror-wrapper').childNodes[0].childNodes[0].CodeMirror
				: document.getElementById('codemirror-focus-wrapper').childNodes[0].CodeMirror;

		return cm;
		*/
	},
	focus: function() {
		this.popupBox.focus();
	},
	focusFields: function() {
		if (!this.state.pluginType || !Plugins[this.state.pluginType]) return;

		const firstRefName = Plugins[this.state.pluginType].InputFields[0].title;
		const firstRef = (firstRefName) ? this.popupInputFields[firstRefName] : null;
		if (firstRef && typeof firstRef.focus === 'function') {
			const focused = firstRef.focus();
			if (!focused) {
				document.body.focus();
			}
		} else {
			document.body.focus();
		}
	},
	onPluginClick: function(event) {
		let clickX;
		let clickY;
		if (event.pageX || event.pageY) {
			clickX = event.pageX;
			clickY = event.pageY;
		} else {
			clickX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			clickY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		this.showAtPos(clickX, clickY);
	},


	showAtPos: function(clickX, clickY) {


		const target = document.elementFromPoint(clickX, clickY);
		// const contentBody = document.getElementById('editor-text-wrapper');

		if (target && target.className.indexOf('ppm-widget') > -1) {

			this.fromIndex = null;
			this.toIndex = null;

			const cm = this.getActiveCodemirrorInstance();
			this.props.cm = cm;

			const selectedLine = cm.coordsChar({left: clickX, top: clickY, mode: 'window'});
			const activeChar = selectedLine.ch;
			const activeLine = selectedLine.line;

			this.updateToken({activeLine, activeChar, isUpdate: false});
			this.focusFields();

		}
	},

	showWithPlugin: function(from, to, widget) {
		this.setState({activeWidget: widget});
		this.updateToken({
			activeLine: from.line,
			activeChar: from.ch + 1,
			isUpdate: false,
		});
	},

	updateToken: function({activeChar, activeLine, isUpdate}) {

		const lastToken = (isUpdate) ? this.state.activeToken : null;
		let activeToken = null;

		const selectedTokens = this.props.cm.getLineTokens(activeLine);
		for (const token of selectedTokens) {
			if (token.start <= activeChar && activeChar <= token.end) {
				activeToken = token;
			}
		}

		const tokenChanged = (isUpdate && activeToken && lastToken && activeToken.type !== lastToken.type);

		if (!activeToken || tokenChanged) {
			this.setState({
				popupVisible: false,
				activeToken: null,
				pluginHash: null,
			});
			return;
		}

		const pluginString = activeToken.string.slice(2, -2);

		// const valueString = pluginSplit.length > 1 ? pluginSplit[1] : ''; // Values split into an array
		const values = parsePluginString(pluginString);
		const pluginType = values.pluginType;

		this.setState({
			popupVisible: true,
			activeLine: activeLine,
			activeChar: activeChar,
			activeToken: activeToken,
			pluginType: pluginType,
			pluginHash: MurmurHash.v2(pluginString),
			initialString: pluginString,
			values: values,
		});

		this.fromIndex = activeToken.start;
		this.toIndex = activeToken.end;

	},
	onPluginSave: function() {
		const cm = this.getActiveCodemirrorInstance();
		const lineNum = this.state.activeLine;
		// const from = {line: lineNum, ch: 0};
		// const to = {line: lineNum, ch: lineContent.length};
		const from = {line: lineNum, ch: this.fromIndex};
		const to = {line: lineNum, ch: this.toIndex};

		const mergedString = `[[${this.createPluginString(this.state.pluginType)}]]`;

		// const outputString = lineContent.replace(this.state.initialString, mergedString);

		cm.replaceRange(mergedString, from, to);
		/*
		if (this.state.activeWidget) {
			this.state.activeWidget.setText(mergedString);
		} else {
			cm.replaceRange(mergedString, from, to);
		}
		*/


		this.toIndex = this.fromIndex + mergedString.length;
	},


	createPluginString: function(pluginType) {
		const PluginInputFields = Plugins[pluginType].InputFields;
		const outputObj = {'pluginType': pluginType};

		for (const pluginInputField of PluginInputFields) {
			// Generate an output string based on the key, values in the object
			const inputFieldTitle = pluginInputField.title;
			const ref = this.popupInputFields[inputFieldTitle];
			const val = ref.value();
			outputObj[inputFieldTitle] = val;
		}

		const mergedString = JSON.stringify(outputObj);
		return mergedString;
	},


	_createPluginString: function(pluginType) {
		let outputVariables = '';

		const PluginInputFields = Plugins[pluginType].InputFields;

		for (const pluginInputField of PluginInputFields) {
			// Generate an output string based on the key, values in the object
			const inputFieldTitle = pluginInputField.title;

			const ref = this.popupInputFields[inputFieldTitle];
			const val = ref.value();

			if (val && val.length) {
				outputVariables += inputFieldTitle + '=' + val + ', ';
			}

		}
		outputVariables = outputVariables.slice(0, -2); // Remove the last comma and space
		const mergedString = outputVariables.length ? pluginType + ': ' + outputVariables : pluginType;
		return mergedString;
	},

	_onInputFieldChange: function() {
		delay(this.onPluginSave, 50);
	},

	closePopup: function() {
		this.setState({popupVisible: false});
	},

	render: function() {

		const PluginInputFields = (this.state.pluginType) ? Plugins[this.state.pluginType].InputFields : [];

		return (
			<Portal onClose={this.closePopup} isOpened={this.state.popupVisible} closeOnOutsideClick closeOnEsc>
				<div style={styles.pluginFlexBox(this.props.isLivePreview)}>
					<div id="plugin-popup"
							ref={(ref) => this.popupBox = ref}
							className="plugin-popup"
							style={[styles.pluginPopup(this.props.isLivePreview), this.state.popupVisible && styles.pluginPopupVisible]}
						>
						<div key={this.state.pluginHash} style={styles.pluginContent}>
							<div style={styles.pluginClose} onClick={this.closePopup}>×</div>
							<div style={styles.pluginPopupTitle}>
								{this.state.pluginType}</div>
								{
										PluginInputFields.map((inputField)=>{
											const fieldType = inputField.type;
											const fieldTitle = inputField.title;
											const PluginInputFieldParams = inputField.params;
											const FieldComponent = InputFields[fieldType];
											const value = (this.state) ? this.state.values[fieldTitle] || null : null;

											return (<div key={'pluginVal-' + fieldTitle + this.state.pluginType} style={styles.pluginOptionWrapper}>
																<label htmlFor={fieldType} style={styles.pluginOptionLabel}>{fieldTitle}</label>
																<div style={styles.pluginPropWrapper}>
																	<FieldComponent
																		selectedValue={value}
																		references={this.state.references}
																		assets={this.props.assets}
																		selections={this.state.selections}
																		saveChange={this.onInputFieldChange}
																		{...PluginInputFieldParams}
																		ref={(ref) => this.popupInputFields[fieldTitle] = ref}/>
																</div>
																<div style={styles.clearfix}></div>
															</div>);
										})
								}
							{/*
							<div style={styles.pluginSave} key={'pluginPopupSave'} onClick={this.onPluginSave}>
								<FormattedMessage {...globalMessages.save} />
							</div>
							*/}
						</div>
					</div>
				</div>
			</Portal>
		);

	}
});

export default Radium(EditorWidgetModal);


styles = {
	pluginClose: {
		position: 'absolute',
		right: '-25px',
		top: '0px',
		cursor: 'pointer',
		fontSize: '1.25em',
		userSelect: 'none',
	},
	pluginFlexBox: function(isLivePreview) {
		return {
			position: 'fixed',
			left: '0vw',
			top: '60px',
			// display: 'flex',
			// alignItems: 'center',
			height: '100vh',
			width: (isLivePreview) ? '50vw' : '100vw',
			zIndex: 50,
			backgroundColor: 'rgba(255,255,255,0.5)',
			pointerEvents: 'none',
		};
	},
	pluginPopup: function(isLivePreview) {
		return {
			width: (isLivePreview) ? '30vw' : '35vw',
			minWidth: '425px',
			position: 'relative',
			margin: (isLivePreview) ? '0px 7vw' : '0px 29.5vw',
			top: '10vh',
			// minHeight: 200,
			backgroundColor: 'white',
			boxShadow: '0px 0px 2px 0px #333',
			// left: `calc(50vw - ${POPUP_WIDTH / 2}px)`,
			minHeight: '35vh',
			opacity: 0,
			transform: 'scale(0.8)',
			transition: '.02s linear transform, .02s linear opacity',
			zIndex: 50,
			padding: '2vh 3vw',
			borderRadius: '1px',
		};
	},
	pluginPopupVisible: {
		opacity: 1,
		transform: 'scale(1.0)',
		pointerEvents: 'auto',
	},
	pluginContent: {
		position: 'relative',
		backgroundColor: 'white',
		zIndex: 10,
	},
	pluginPopupTitle: {
		padding: '6px 6px',
		fontSize: '25px',
		textTransform: 'capitalize',
		fontFamily: 'Courier',
		marginBottom: '10px',
	},
	pluginSave: {
		padding: '6px 20px 6px 0px',
		fontSize: '18px',
		display: 'inline-block',
		float: 'right',
		color: '#666',
		fontFamily: '"Lato", sans-serif',
		marginBottom: '15px',
		':hover': {
			cursor: 'pointer',
			color: 'black',
		},
	},
	pluginOptionWrapper: {
		margin: '0px 10px 15px 10px',
		fontFamily: 'Courier',
	},
	pluginOptionLabel: {
		// width: '100%',
		display: 'inline-block',
		marginRight: '20px',
		width: '20%',
		textTransform: 'capitalize',
		fontSize: '0.95em',
		verticalAlign: 'top',
		paddingTop: '3px',
	},
	pluginOptionInput: {
		width: 'calc(50% - 4px)',
		padding: 0,
		float: 'left',
	},
	pluginOptionDefault: {
		width: 'calc(50% - 10px)',
		padding: '0px 5px',
		float: 'left',
		fontSize: '14px',
		color: '#bbb',
		display: 'none'
	},
	pluginOptionDefaultVisible: {
		display: 'block'
	},
	pluginPropSrc: {
		width: '75%'
	},
	pluginPropWrapper: {
		display: 'inline-block',
		width: '75%'
	},
	clearfix: {
		display: 'table',
		clear: 'both',
	}
};