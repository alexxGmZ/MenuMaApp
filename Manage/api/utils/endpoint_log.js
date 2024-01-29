function endpoint_log(request_protocol, api_endpoint, ip_requested) {
	const currentDate = new Date();
	const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
	return console.log(`${request_protocol} request for ${api_endpoint} from ${ip_requested} ${formattedDate}`);
}

module.exports = {
	endpoint_log
}

