<!DOCTYPE html>
<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>JSP Page</title>
	</head>

	<body>
		<!‐‐ 引入Echarts3包 ‐‐>
		<script type="text/javascript" src="js/jquery.min.js"></script>

		<body>
			<!‐‐ 引入Jquery包 ‐‐>
			<script type="text/javascript" src="js/echarts.min.js"></script>
			<h1>tree演示</h1>
			<div id="main" style="width: 1200px;height:400px;"></div>
			<script type="text/javascript">
				// 基于准备好的dom，初始化echarts实例
				var myChart = echarts.init(document.getElementById('main'));
				myChart.showLoading();
				$.get('/data/treeData.json', function(data) {
					console.log(data);
					myChart.hideLoading();
					myChart.setOption(option = {
						tooltip: {
							trigger: 'item',
							triggerOn: 'mousemove'
						},
						series: [{
							type: 'tree',
							data: [data],
							top: '18%',
							bottom: '14%',
							layout: 'radial',
							symbol: 'emptyCircle',
							symbolSize: 7,
							initialTreeDepth: 1,
							animationDurationUpdate: 750
						}]
					});
				});
			</script>
		</body>
</html>