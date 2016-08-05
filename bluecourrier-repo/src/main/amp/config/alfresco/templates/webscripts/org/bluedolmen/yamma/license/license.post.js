// Force the success result attribute to true
// That may be useful for some clients that needs this param (e.g. ExtJs)
if ("undefined" != typeof result) {
	result.success = true;
}