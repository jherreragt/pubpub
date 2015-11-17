import React from 'react';
import Radium from 'radium';
import {baseStyles} from './modalStyle';
import {globalStyles} from '../../utils/styleConstants';

let styles = {};

const EditorModalCollaborators = React.createClass({
	getInitialState: function() {
		return {
			showInviteOptions: false,
		};
	},
	toggleshowInviteOptions: function() {
		this.setState({
			showInviteOptions: !this.state.showInviteOptions,	
		});
	},
	render: function() {
		const sampleCollaborators = [
			{
				image: 'https://s3.amazonaws.com/pubpub-upload/lip.png',
				name: 'Andy Lippman',
				permissions: 'edit'
			},
			{
				image: 'https://s3.amazonaws.com/pubpub-upload/travis.png',
				name: 'Cesar Hidalgo',
				permissions: 'read'
			},
			{
				image: 'https://s3.amazonaws.com/pubpub-upload/kevin.png',
				name: 'Kevin McManus',
				permissions: 'edit'
			},
		];

		return (
			<div>
				<h2 style={baseStyles.topHeader}>Collaborators</h2>
				<div style={[baseStyles.rightCornerSearch, styles.mainContent[this.state.showInviteOptions]]}>
					<input style={baseStyles.rightCornerSearchInput} type="text" placeholder="Add new collaborator"/>
					<div key="refAdvancedText" style={baseStyles.rightCornerSearchAdvanced} onClick={this.toggleshowInviteOptions}>invite by email</div>
				</div>

				<div style={[baseStyles.rightCornerAction, styles.addOptions, styles.addOptions[this.state.showInviteOptions]]} onClick={this.toggleshowInviteOptions}>
					Back
				</div>


				<div className="main-ref-content" style={styles.mainContent[this.state.showInviteOptions]}>
					<div style={styles.rowContainer}>

						<div style={[styles.imageColumn, styles.columnHeader]}></div>
						<div style={[styles.nameColumn, styles.columnHeader]}>name</div>
						<div style={[styles.permissionsColumn, styles.columnHeader]}>permissions</div>
						<div style={[styles.optionColumn, styles.columnHeader]}></div>

						<div style={styles.clearfix}></div>
					</div>
					

					{
						sampleCollaborators.map((collaborator, index) => {
							return (
								<div key={'collaborator-' + index} style={styles.rowContainer}>

									<div style={[styles.imageColumn, styles.columnHeader]}> <img style={styles.userImage} src={collaborator.image} /> </div>
									<div style={[styles.nameColumn]}>{collaborator.name}</div>
									<div style={[styles.permissionsColumn]}>
										<span key={'collaboratorPermissionsEdit-' + index} style={[styles.permission, collaborator.permissions === 'edit' && styles.permissionActive]}>can edit</span>
										<span style={styles.permissionSeparator}>|</span>
										<span key={'collaboratorPermissionsRead-' + index} style={[styles.permission, collaborator.permissions === 'read' && styles.permissionActive]}>can read only</span>
									</div>
									<div style={[styles.optionColumn]}>remove</div>

									<div style={styles.clearfix}></div>
								</div>
							);
						})
					}
					
				</div>

				<div className="add-options-content" style={[styles.addOptions, styles.addOptions[this.state.showInviteOptions], styles.addOptionsContent]}>

					<h2 style={styles.sectionHeader}>Invite By Email</h2>
					<input type="text" placeholder="email address" />

				</div>

			</div>
		);
	}
});

export default Radium(EditorModalCollaborators);

styles = {
	mainContent: {
		true: {
			display: 'none',
		},
	},
	addOptions: {
		true: {
			display: 'block',
		},
		display: 'none',
		
	},
	addOptionsContent: {
		padding: '15px 25px',
	},
	rowContainer: {
		width: 'calc(100% - 30px)',
		padding: 15,
		fontFamily: baseStyles.rowTextFontFamily,
		fontSize: baseStyles.rowTextFontSize,
	},
	columnHeader: {
		fontFamily: baseStyles.rowHeaderFontFamily,
		fontSize: baseStyles.rowHeaderFontSize,
		height: '30px',
	},
	imageColumn: {
		width: '30px',
		padding: '0px calc(5% - 15px)',
		float: 'left',
	},
	userImage: {
		width: '30px',
	},
	nameColumn: {
		width: 'calc(30% - 20px)',
		padding: '0px 10px',
		float: 'left',
	},
	permissionsColumn: {
		width: 'calc(50% - 20px)',
		padding: '0px 10px',
		float: 'left',
	},
	optionColumn: {
		width: 'calc(10% - 10px)',
		padding: '0px 5px',
		float: 'left',
		textAlign: 'center',
	},
	clearfix: {
		// necessary because we float elements with variable height 
		display: 'table',
		clear: 'both',
	},
	sectionHeader: {
		margin: 0,
	},
	permission: {
		color: globalStyles.veryLight,
		':hover': {
			cursor: 'pointer',
			color: globalStyles.sideText,
		},
	},
	permissionSeparator: {
		padding: '0px 10px',
	},
	permissionActive: {
		color: 'black',
		':hover': {
			cursor: 'default',
			color: 'black',
		},
	},
};