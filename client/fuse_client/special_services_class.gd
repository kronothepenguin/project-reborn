extends Node

var _process_list: Array = []

func send_process_tracking(step_value):
	_process_list.append(step_value)
	if VariableContainer.exists("processlog.url"):
		var report_url := str(VariableContainer.get_var("processlog.url"))
		if report_url == "javascript" and OS.has_feature("web"):
			var console = JavaScriptBridge.get_interface("console")
			console.log(step_value)
		elif not report_url.is_empty():
			var account_id: int = VariableContainer.get_var("account_id", 0)
			var http := HTTPRequest.new()
			http.request(report_url, [], HTTPClient.METHOD_POST, "step=%d&account_id=%d" % [step_value, account_id])
