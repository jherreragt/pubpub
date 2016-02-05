import React, {PropTypes} from 'react';
import Radium from 'radium';
import {navStyles} from '../../utils/styleConstants';
import {PubPreview, UserPreview, JournalPreview} from '../ItemPreviews';

import {globalMessages} from '../../utils/globalMessages';
import {FormattedMessage} from 'react-intl';

let styles = {};

const UserFollows = React.createClass({
	propTypes: {
		profileData: PropTypes.object,
		ownProfile: PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			profileData: {
				discussions: [],
				pubs: [],
			},
		};
	},

	getInitialState: function() {
		return {
			mode: 'pubs',
		};
	},

	setMode: function(mode) {
		return ()=>{
			this.setState({mode: mode});
		};
	},

	render: function() {
		// console.log(this.props.profileData);
		return (
			<div style={styles.container}>

				<ul style={[navStyles.navList, styles.subNav]}>
					<li key="subNav0"style={[navStyles.navItem, navStyles.left, navStyles.navItemShow, styles.noLeftPadding, styles.inactiveNav, this.state.mode === 'pubs' && styles.activeNav]} onClick={this.setMode('pubs')}>
						<FormattedMessage {...globalMessages.pubs} /> ({this.props.profileData.following.pubs.length})
					</li>
					<li style={[navStyles.navSeparator, navStyles.left, navStyles.navItemShow]}></li>

					<li key="subNav1"style={[navStyles.navItem, navStyles.left, navStyles.navItemShow, styles.inactiveNav, this.state.mode === 'users' && styles.activeNav]} onClick={this.setMode('users')}>
						<FormattedMessage {...globalMessages.People} /> ({this.props.profileData.following.users.length})
					</li>
					<li style={[navStyles.navSeparator, navStyles.left, navStyles.navItemShow]}></li>

					<li key="subNav2"style={[navStyles.navItem, navStyles.left, navStyles.navItemShow, styles.inactiveNav, this.state.mode === 'journals' && styles.activeNav]} onClick={this.setMode('journals')}>
						<FormattedMessage {...globalMessages.Journals} /> ({this.props.profileData.following.journals.length})
					</li>
				</ul>


				{
					this.props.profileData.following[this.state.mode].map((item, index)=>{
						return (<div key={'followsItem-' + index}>
							{item.slug 
								? <PubPreview pubData={item} />
								: null
							}

							{item.username 
								? <UserPreview userData={item} />
								: null
							}

							{item.subdomain 
								? <JournalPreview journalData={item} />
								: null
							}

						</div>);
					})
				}

			</div>
		);
	}
});

export default Radium(UserFollows);

styles = {
	subNav: {
		margin: '10px 0px',
		borderBottom: '1px solid #CCC',
	},
	noLeftPadding: {
		padding: '0px 20px 0px 2px',
	},
	inactiveNav: {
		color: '#bbb',
	},
	activeNav: {
		color: '#333',
	},
};
