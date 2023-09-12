import { Network } from '@capacitor/network';

Network.addListener('networkStatusChange', status => {
	console.log('Network status changed', status);
});

const logCurrentNetworkStatus = async () => {
	const json_container = document.getElementById("connection_type");
	const status = await Network.getStatus();

	console.log('Network connection status:', status.connected);
	console.log('Network connection type:', status.connectionType);
	json_container.textContent = `Status: ${status.connected}\nType: ${status.connectionType}`;
};

logCurrentNetworkStatus();


