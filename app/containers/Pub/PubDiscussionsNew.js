import React, { PropTypes } from 'react';
import Radium from 'radium';
import { Loader } from 'components';
import { globalStyles } from 'utils/globalStyles';
import { globalMessages } from 'utils/globalMessages';
import { FormattedMessage } from 'react-intl';
import { postDiscussion } from './actionsDiscussions'
import PubLabelList from './PubLabelList';

let styles;

export const PubDiscussionsNew = React.createClass({
	propTypes: {
		pubId: PropTypes.number,
		labelsData: PropTypes.array,
		isLoading: PropTypes.bool,
		error: PropTypes.string,
		dispatch: PropTypes.func,
	},

	getInitialState() {
		return {
			title: '',
			description: '',

		};
	},

	inputUpdate: function(key, evt) {
		const value = evt.target.value || '';
		this.setState({ [key]: value });
	},

	validate: function(data) {
		// Check to make sure name exists
		if (!data.title || !data.title.length) {
			return { isValid: false, validationError: <FormattedMessage id="discussion.TitleRequired" defaultMessage="Title Required" /> };
		}

		return { isValid: true, validationError: undefined };

	},

	createSubmit: function(evt) {
		evt.preventDefault();
		const createData = {
			replyRootPubId: this.props.pubId,
			replyParentPubId: this.props.pubId,
			title: this.state.title,
			description: this.state.description,
		};
		const { isValid, validationError } = this.validate(createData);
		this.setState({ validationError: validationError });
		console.log(createData);
		if (isValid) {
			this.props.dispatch(postDiscussion(createData.replyRootPubId, createData.replyParentPubId, createData.title, createData.description));	
		}
	},

	render: function() {
		const newDiscussionData = {};
		const labelList = this.props.labelsData || [];
		const isLoading = this.props.isLoading;
		const serverErrors = {
			'Slug already used': <FormattedMessage id="discussion.JournalURLalreadyused" defaultMessage="Journal URL already used" />,
		};
		const errorMessage = serverErrors[this.props.error] || this.state.validationError;
		return (
			<div style={styles.container}>
				<h3>New Discussion</h3>
				<form onSubmit={this.createSubmit}>
					<PubLabelList allLabels={labelList} />
					<input id={'journalName'} name={'journal name'} placeholder={'Title'} type="text" style={styles.input} value={this.state.title} onChange={this.inputUpdate.bind(this, 'title')} />
						
					<textarea id={'description'} name={'description'} type="text" style={[styles.input, styles.description]} value={this.state.description} onChange={this.inputUpdate.bind(this, 'description')} />
					

					<button className={'pt-button pt-intent-primary'} onClick={this.createSubmit}>
						Create New Discussion
					</button>

					<div style={styles.loaderContainer}>
						<Loader loading={isLoading} showCompletion={!errorMessage} />
					</div>

					<div style={styles.errorMessage}>{errorMessage}</div>

				</form>
			</div>
		);
	}
});

export default Radium(PubDiscussionsNew);

styles = {
	container: {
		
	},
	input: {
		width: '100%',
	},
	loaderContainer: {
		display: 'inline-block',
		position: 'relative',
		top: 15,
	},
	description: {
		height: '8em',
	},
	errorMessage: {
		padding: '10px 0px',
		color: globalStyles.errorRed,
	},
};
