function extract_ipv4(ip) {
	if (ip.startsWith('::ffff:')) {
		return ip.replace('::ffff:', ''); // Remove the '::ffff:' prefix
	}
	return ip;
}

module.exports = {
	extract_ipv4
}
