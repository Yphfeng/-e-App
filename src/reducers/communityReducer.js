'use strict';
import * as types from '../constants/user/userTypes';

/**
 * [圈子发布]
 * @type {Object}
 */
const initialState = {
	title: '',
	photoUrls: [],
	videoUrl: '',
	audioUrl: '',
	audioPath: '',
	audioDuration: 0,
	content: '',
};

export default function community(state = initialState, action) 
{
	switch (action.type) 
	{
	case 'PB_TITLE':
		return {
			...state,
			title: action.title,
		}
	case 'PB_IMGARR':
		return {
			...state,
			photoUrls: action.photoUrls,

		}
	case 'PB_VIDEO':
		return {
			...state,
			videoUrl: action.videoUrl,
		}
	case 'PB_AUDIO':
		return {
			...state,
			audioUrl: action.audioUrl,
			audioPath: action.audioPath,
			audioDuration: action.audioDuration,
		}
	case 'PB_CONTENT':
		return {
			...state,
			content: action.text,
		}
	case 'CLEAR_PB':
		return {
			...state,
			title: '',
			photoUrls: [],
			videoUrl: '',
			audioUrl: '',
			audioPath: '',
			audioDuration: 0,
			content: '',
		}
	default:	
		return state;
	}
}