
//根据信号强度的处理

export function deviceSignal(dataArray)
{

	var len = dataArray.length;
	var returnArray = [];
	var item;
	if (len == 0)
	{
		return dataArray
	}
	else
	{
		for (var i = 0; i < len; i++)
		{
			if (dataArray[i].siginal >= -70)
			{
				item = dataArray[i];
				item.livel = 1;
				returnArray.push(item)
			}
			else if ( dataArray[i].siginal >= -80 && dataArray[i].siginal < -70 )
			{
				item = dataArray[i];
				item.livel = 2;
				returnArray.push(item)
			}
			else
			{
				item = dataArray[i];
				item.livel = 3;
				returnArray.push(item)
			}
		}
		return returnArray;
	}
}

//单个设备信号强度处理
export function deviceSimpleSignal(device)
{
	if (device.siginal >= -70)
	{
		device.livel = 1;
	}
	else if ( device.siginal >= -80 && device.siginal < -70 )
	{
		
		device.livel = 2;
	}
	else
	{
		device.livel = 3;
		
	}
	return device;
}