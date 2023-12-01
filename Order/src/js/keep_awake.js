import { KeepAwake } from "@capacitor-community/keep-awake";

const isSupported = async () => {
	const result = await KeepAwake.isSupported();
	return result.isSupported;
};

export const keepAwake = async () => {
	if (isSupported) {
		await KeepAwake.keepAwake();
	}
};

