import React from 'react';
import {SimpleSelect} from 'react-selectize';
// import {openModal} from '../../actions/editor';


export function src(assetType) {

	const filterAssets = function(asset) {
		return (asset.assetType === assetType);
	};

	return {
		title: 'src',
		default: '',
		defaultValue: '',
		defaultString: '',
		valueFunction: function(ref) {
			const val = ref.value();
			return (val) ? val.value : null;
		},
		component: function(pluginProp, value, props, styles) {
			const title = pluginProp.title;
			const assets = (props.assets) ? Object.values(props.assets).filter(filterAssets).map( function(asset) { return {'value': asset.refName, 'label': asset.refName};}) : [];
			// assets.push({'value': 'upload', 'label': 'Upload New'});
			const val = (value) ? {'value': value, 'label': value } : undefined;

			const onValueChange = function(changedValue, callback) {
				callback();
			};
			return <SimpleSelect style={styles.pluginPropSrc} onValueChange={onValueChange} ref={'pluginInput-' + title} name={title} id={title} options={assets} defaultValue={val}/>;
		}
	};
}

export const srcRef = {
	title: 'srcRef',
	default: '',
	defaultValue: '',
	defaultString: '',
	valueFunction: function(thisRef) {
		const val = thisRef.value();
		return (val) ? val.value : null;
	},
	component: function(pluginProp, value, props, styles) {
		const title = pluginProp.title;
		const refs = (props.references) ? Object.values(props.references).map( function(ref) { return {'value': ref.refName, 'label': ref.refName + ' ' + ref.title};}) : [];
		// assets.push({'value': 'upload', 'label': 'Upload New'});
		const val = (value) ? {'value': value, 'label': value } : undefined;

		const onValueChange = function(changedValue, callback) {
			callback();
		};
		return <SimpleSelect style={styles.pluginPropSrc} onValueChange={onValueChange} ref={'pluginInput-' + title} name={title} id={title} options={refs} defaultValue={val}/>;
	}
};

export const width = {
	title: 'width',
	defaultValue: '',
	defaultString: '100%',
};


export const height = {
	title: 'height',
	defaultValue: '',
	defaultString: 'auto',
};

export const align = {
	title: 'align',
	defaultValue: '',
	defaultString: 'center',
};