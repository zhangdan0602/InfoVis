(function() {
	//构造；斜线生成器；直径；div；间隔；高度；i；半径；重构祖先；改关注；根；存储更新；svg布局；树；树数据；更新函数；zoom
	var construct_generations, diagonal, diameter, div, duration, height, i, radius,
		reconstruct_ancestors, reform_focus, root, store_and_update, 
		svg, tree, treeData, update, zoom;

	window.current_nodes = [];

	update = function(source) {
		var link, links, node, nodeEnter, nodeExit, nodeUpdate, nodes;
		// Compute the new tree layout.计算新树图的布局
		//计算父布局并返回一组节点。
		nodes = tree.nodes(root).reverse();
		//计算树节点的父-子连接
		links = tree.links(nodes);
		// Normalize for fixed-depth.设置y坐标点，每层占80px
		//为每个指定的节点调用一个函数。
		nodes.forEach(function(d) {
			//每个节点与父节点的距离
			return d.y = d.depth * 80;
		});
		// Update the nodes…每个node对应一个group
		//选择画布中的所有节点，设置元素的数据
		//data()：绑定一个数组到选择集上，数组的各项值分别与选择集的各元素绑定
		node = svg.selectAll("g.node").data(nodes, function(d) {
			return d.id || (d.id = ++i);
		});
		// 新增节点数据集，设置位置
		//在 svg 中添加一个g，g是 svg 中的一个属性，是 group 的意思，
		//它表示一组什么东西，如一组 lines ， rects ，circles 其实坐标轴就是由这些东西构成的。
		nodeEnter = node.enter().append("g")
			//attr设置html属性，style设置css属性
			.attr("class", "node")
			.attr("transform", function(d) {}, {},
				"translate(" + source.y0 + "," + source.x0 + ")")
			//on设置鼠标点击属性
			.on("mouseover", function(d) {}).on("click", function(d) {
				var clicked_same_node;
				clicked_same_node = false;
				if(window.current_nodes.length > 0) {
					if(d.id === window.current_nodes[window.current_nodes.length - 1][0].id) {
						clicked_same_node = true;
						d3.event.stopPropagation();
					}
				}
				if(!clicked_same_node) {
					return store_and_update(d);
				}
			});
		//在新增节点数据集中添加一个circles
		nodeEnter.append("circle")
			//attr设置circles属性
			.attr("r", 1e-9)
			.style("fill", function(d) {
				if(d._children) {
					//归结parent
					return "lightsteelblue";
				} else {
					//生成childern
					return "#ABCCSA";
				}
			});
		//添加标签
		nodeEnter.append("text")
			.attr("dy", ".50em")
			.attr("text-anchor", function(d) {
				if(d.x < 180) {
					return "start";
				} else {
					return "end";
				}
			})
			.attr("transform", function(d) {
				if(d.x < 180) {
					//设置投影的平移位置
					return "translate(8)";
				} else {
					//projection.rotate - 取得或设置投影的三轴旋转角
					return "rotate(180)translate(-8)";
				}
			})
			.text(function(d) {
				return d.name;
			});
		// 将节点过渡到一个新的位置-----主要是针对节点过渡过程中的过渡效果
		//node就是保留的数据集，为原来数据的图形添加过渡动画。首先是整个组的位置
		//开始一个动画过渡
		nodeUpdate = node.transition()
			//过渡延迟时间,此处主要设置的是圆圈节点随斜线的过渡延迟
			.duration(duration)
			.attr("transform", function(d) {
				//旋转的结果 90时才会与parent连上
				return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
			});
		nodeUpdate.select("circle")
			//圈的大小
			.attr("r", 8)
			.style("fill", function(d) {
				if(d._children) {
					//【归结为parent】点击后的结果
					return "red";
				} else {
					return "blue";
				}
			});
		nodeUpdate.select("text")
			.style("fill-opacity", 1)
			.attr("dy", ".31em")
			.attr("text-anchor", function(d) {
				if(d.x < 180) {
					return "start";
				} else {
					return "end";
				}
			}).attr("transform", function(d) {
				if(d.x < 180) {
					return "translate(8)";
				} else {
					return "rotate(180)translate(-8)";
				}
			});

		// Transition exiting nodes to the parent's new position.过渡现有的节点到父母的新位置。
		//最后处理消失的数据，添加消失动画
		nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function(d) {
				return "translate(" + source.y + "," + source.x + ")";
			}).remove();

		nodeExit.select("circle")
			.attr("r", 1e-6);
		nodeExit.select("text")
			.style("fill-opacity", 1e-6);
		// Update the links…线操作相关
		//再处理连线集合
		link = svg.selectAll("path.link")
			.data(links, function(d) {
				return d.target.id;
			});
		//添加新的连线
		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", function(d) {
				var o;
				o = {
					x: source.x0,
					y: source.y0
				};
				//diagonal - 生成一个二维贝塞尔连接器, 用于节点连接图.
				return diagonal({
					source: o,
					target: o
				});
			});
		//将斜线过渡到新的位置
		//保留的连线添加过渡动画
		link.transition()
			.duration(duration)
			.attr("d", diagonal);
		// Transition exiting nodes to the parent's new position.过渡现有的斜线到父母的新位置。
		//消失的连线添加过渡动画
		link.exit().transition()
			.duration(duration)
			.attr("d", function(d) {
				var o;
				o = {
					x: source.x,
					y: source.y
				};
				return diagonal({
					source: o,
					target: o
				});
			}).remove();
		//将旧的斜线过渡效果隐藏
		return nodes.forEach(function(d) {
			d.x0 = d.x;
			return d.y0 = d.y;
		});
	};
	//生成子节点
	construct_generations = function(d) {
		var c, generations;
		c = d;
		generations = [];
		while(c.parent) {
			generations.push(c.parent.children);
			c = c.parent;
		}
		return generations;
	};
	//改关注点
	reform_focus = function() {
		var count, d, set;
		if(window.current_nodes.length > 0) {
			set = window.current_nodes.pop();
			d = set[0];
			count = 0;
			d.parent._children = set[1];
			if(d.parent._children) {
				while(d.parent) {
					d.parent.children = set[1][count];
					count++;
					d = d.parent;
				}
				return update(d);
			}
		}
	};
	//存储更新
	store_and_update = function(d) {
		window.current_nodes.push([d, construct_generations(d)]);
		while(d.parent) {
			d.parent._children = d.parent.children;
			d.parent.children = [
				_.find(d.parent.children, function(e) {
					return e.name === d.name;
				})
			];
			d = d.parent;
		}
		d3.event.stopPropagation();
		return update(d);
	};
	//重构祖先
	reconstruct_ancestors = function(n, generations) {
		var count;
		count = generations.length - 1;
		while(n.parent) {
			n.parent.children = generations[count];
			count -= 1;
			n = n.parent;
		}
		return n;
	};
	//点击时：调用reform_focus函数
	$("body").click(function() {
		return reform_focus();
	});
	//直径
	diameter = 960;

	height = diameter - 30;

	radius = diameter / 2;

	root = void 0;
	//height weight
	tree = d3.layout.tree().size([360, radius - 60]);
	//过渡延迟时间
	i = 0;

	duration = 1000;
	//创建新的斜线生成器
	diagonal = d3.svg.diagonal
		.radial().projection(function(d) {
			return [d.y, d.x / 180 * Math.PI];
		});

	zoom = function() {
		return svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	};

	div = d3.select("#focus");
	//声明与定义画布属性
	svg = div.insert("svg")
		.attr("viewbox", "0 0 " + diameter / 2 + "," + diameter / 2)
		.attr("width", "1028px")
		.attr("height", "100%")
		.append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")")
		.append("g")
		.call(d3.behavior.zoom().scaleExtent([0, 10])
			.on("zoom", zoom));

	//root = treeData[0];
	//加载json数据
	
	d3.json("./data/topic_info_dianying.json", function(data) {
		console.log(data[0]);
		root = data; //treeData为上边定义的节点属性
		root.x0 = height / 2;
		root.y0 = 0;
		update(root);
	});
}).call(this);