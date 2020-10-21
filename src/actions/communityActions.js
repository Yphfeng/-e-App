/**
 * 
 * @param {添加标题} title 
 */
export const pbTitle = title => 
{
	return {
		type: "PB_TITLE",
		title: title,
	}
}

/**
 * 
 * @param {添加图片} imgArr 
 */
export const pbImg = photoUrls =>
{
	return {
		type: 'PB_IMGARR',
		photoUrls: photoUrls,
	}
}

/**
 * 
 * @param {添加视频} videoUrl 
 */
export const pbVideo = videoUrl => 
{
	return {
		type: 'PB_VIDEO',
		videoUrl: videoUrl,
	}
}

/**
 * 
 * @param {添加语音} audioUrl 
 */
export const pbAudio = (audioUrl, path, audioDuration) => 
{
	return {
		type: 'PB_AUDIO',
		audioUrl: audioUrl,
		audioPath: path,
		audioDuration: audioDuration,
	}
}

/**
 * 
 * @param {语音转文字} text 
 */
export const pbContent = text => 
{
	return {
		type: 'PB_CONTENT',
		text: text,
	}
}

/**
 * 清空提交的值
 */
export const clearPb = () => 
{
	return {
		type: 'CLEAR_PB',
	}
}