//公共变量
var cards = 3;  //牌的数量

//存放未打乱牌的数组
var arrayCards = new Array();
for(var i = 0; i < cards; i ++){
	arrayCards.push(i,i);
}


//数组元素随机排序
function randomSort(array) {
	var randomArray = new Array();
	var len = array.length;
	for(var i = 0; i < len; i ++){
		var index = Math.ceil((Math.random()*(array.length-1)));
		randomArray.push(array[index]);
		if(index != (array.length-1)){
			array[index] = array[array.length-1];
		}
		array.pop();
	}
	return randomArray;
}

//设置随机背景音乐
var controlBg = document.getElementById("bgMusic");
var controlEff = document.getElementById("effectMusic");
var musics = ["孤独月","千之缘","砕月"];
var index = Math.random();
if(index <= 0.33){
	index = 0;
}else if(index <=0.66){
	index = 1;
}else{
	index = 2;
}

$(controlBg).attr("src", "music/" + musics[index] + ".mp3");
// controlBg.volume=0.1;
// controlBg.play();

//遇到的问题:背景音乐Chrome刷新之后没法再次触发
// $(controlBg).click(function(){
// 	controlBg.load();
// 	controlBg.play();
// }).trigger("click");
// 
// window.onload = function(){
// 	controlBg.play();
// }
// $(function(){
// 	$("#bgMusic>source").attr("src", "music/" + musics[index] + ".mp3");
// 	controlBg.play();
// });

$button = $("#begin");
$mask = $("#mask");

// 间隔器id
var id;

//开始游戏核心部分
function start(){
	$mask.empty();
	prepare();
	gameBegin();
}

//首次开始按钮
window.setTimeout(function(){
	$("#begin").click(start);
}, 2000);

//载入DOM元素，为游戏开始做准备
function prepare(){
	$('<div id="header"><label></label><div id="restart">重新开始</div></div>').appendTo($mask);
	$('<div id="cards"></div>').appendTo($mask);
	$('<div id="obstacle"><div>').appendTo("#cards");
	//重新开始按钮
	$("#restart").click(function(){
		window.clearInterval(id);
		start();
	});
}

//游戏开始
function gameBegin(){
//计时器
	var time = 0;
	var min;
	var sec;
	//定义比较数组（容量为2）用于比较值的大小
	var compare = new Array();
	//定义翻正确的牌对数
	var correct = 0;
	
	$label = $("#header>label");
	$label.text("时间：" + "00:00");
//展示游戏时间
	id = window.setInterval(function(){
		++ time; 
		min = Math.floor(time/60);
		//时间判断（少于10在前缀加个0)
		min = min<10?("0"+min):min;
		sec = time%60;
		sec = sec<10?("0"+sec):sec;
		$label.text("时间：" + min + ":" + sec);
	}, 1000);
	//使用文档碎片
	var cardList = document.createDocumentFragment();
	$cardList = $(cardList);
	//获取乱排序好的数组
	arrayCards = randomSort(arrayCards);

	//依次在文档碎片加入对应的元素
	$.each(arrayCards, function(index){
		//给元素创建DOM结构和背景设置
		$card = $('<div class="card"><div>');
		$card.data("value",Number(this));
		$(this).data("isOpen", false);
		//给元素设置事件		
		$card.bind({
			"mouseenter":function(){
				//遇到的问题：翻牌错误被翻回去之后需要将翻牌回去的最后状态的对应class去除
				$(this).removeClass("cardBackOut").removeClass("cardRotateBack");
				$(this).addClass("cardBackEnter");
			},
			"mouseleave":function(){
				$(this).removeClass("cardBackEnter").removeClass("cardRotateBack");
				$(this).addClass("cardBackOut");
			},
			"click": function(){
				//先判定该牌是否处于打开状态
				if(!$(this).data("isOpen")){
					//设置点击效果音
					$("#effectMusic>source").attr("src", "music/1.mp3");
					//设置为重新加载，可同时触发效果音
					controlEff.load();
					controlEff.play();
					//修改牌为翻开状态
					$(this).data("isOpen", true);
					$temper = $(this);
					//翻开的时候修改背景图片
					window.setTimeout(function(){
						$temper.css("background", "url(img/"+ $temper.data("value") +".png) no-repeat");
					}, 150);
					//加入翻牌动作
					$(this).addClass("cardRotate");
					//将牌放进数组
					compare.push($(this));
					//两张牌是否已翻开
					if(compare.length == 2){
						//将屏板置于顶部，防止用户在看两张牌时翻第三张牌
						$("#obstacle").css("z-index", "100");
						window.setTimeout(function(){
							$later = compare.pop();
							$pre = compare.pop();
							//判断两者的值是否相同
							if($pre.data("value") == $later.data("value")){
								//翻牌对数加一
								correct ++;
								$("#effectMusic>source").attr("src", "music/0.mp3");
								controlEff.load();
								controlEff.play();
								$pre.removeClass("cardRotate").css("background", "#fff").addClass("disappear");
								$later.removeClass("cardRotate").css("background", "#fff").addClass("disappear");
								window.setTimeout(function(){
									$pre.css("z-index", "0");
									$later.css("z-index", "0");
									$("#obstacle").css("z-index", "40");
									//反牌对数到3则停止计时，清空蒙版所有元素并建立DOM元素
									if(correct == 3){
										window.clearInterval(id);
										// console.log("游戏完成，所用时间：" + min + ":" + sec);
										$mask.empty();
										$('<h1 id="over">完成时间 ' +  min + ':' + sec + '</h1><div id="overbutton">再次挑战</div>').appendTo($mask);
										$("#overbutton").click(start);
									}
								}, 600);
							}else{
								$pre.removeClass("cardRotate").addClass("cardRotateBack");
								$later.removeClass("cardRotate").addClass("cardRotateBack");
								window.setTimeout(function(){
									$pre.css("background", "url(img/all.png) no-repeat").css("background-size", "100% 100%");
									$later.css("background", "url(img/all.png) no-repeat").css("background-size", "100% 100%");
								}, 180);
								//将牌全部设置为未翻开
								$pre.data("isOpen", false);
								$later.data("isOpen", false);
								window.setTimeout(function(){
									$("#obstacle").css("z-index", "40");
								}, 400);
							}
						},1000);
					}
				}
			}
		});
		$card.appendTo(cardList);
	});
	$cardList.appendTo($("#cards"));
}
