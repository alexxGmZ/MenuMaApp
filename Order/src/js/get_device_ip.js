function getLocalIpAddress() {
	return new Promise((resolve, reject) => {
		const rtcPeerConnection = new RTCPeerConnection({ iceServers: [] });

		rtcPeerConnection.createDataChannel('');

		rtcPeerConnection.createOffer()
			.then(offer => rtcPeerConnection.setLocalDescription(offer))
			.catch(error => reject(error));

		rtcPeerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				const ipAddress = extractIpAddress(event.candidate.candidate);
				resolve(ipAddress);
			}
		};
	});
}

function extractIpAddress(candidate) {
	const ipAddressRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
	const matches = ipAddressRegex.exec(candidate);
	return matches ? matches[1] : null;
}

// Usage
getLocalIpAddress()
	.then(ipAddress => document.getElementById("device_ip_address").textContent = ipAddress)
