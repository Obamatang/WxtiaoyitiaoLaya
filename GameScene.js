(function (_super){
	Laya.MiniAdpter.init();

    function GameScene(){
        GameScene.super(this);
    // 游戏场景组
    this.blockPanel = new Laya.Panel();
    this.blockPanel.width = 640;
    this.blockPanel.height = 1136;
    //背景
    this.bg = new Laya.Image("jump/bg.jpg");
    this.blockPanel.addChild(this.bg);
    this.addChild(this.blockPanel);
	// 小 i
    this.player =new Laya.Image("jump/piece.png");
    this.player.width = 48;
    this.player.height = 130;
    this.player.pos(192,448);
    this.blockPanel.addChild(this.player);
    // 游戏场景中的积分
    this.scoreLabel =new Laya.Label();
    this.scoreLabel.text = '0';
    this.scoreLabel.pos(100,100);
    this.scoreLabel.color = "0x070303";
    this.scoreLabel.fontSize = "90";
    this.blockPanel.addChild(this.scoreLabel);
    // 所有方块资源的数组
    this.blockSourceNames = [];
    // 按下的音频
    this.pushVoice =new Laya.Sound();
    // 按下音频的SoundChannel对象
    this.pushSoundChannel =new Laya.SoundChannel();
	// 弹跳的音频
    this.jumpVoice =new Laya.Sound();
    // 所有方块的数组
    this.blockArr = [];//类型为Laya.Image
    // 所有回收方块的数组
    this.reBackBlockArr = [];//类型为Laya.Image
    // 当前的盒子（最新出现的盒子）
    this.currentBlock;//类型为Laya.Image
    // 下一个盒子方向(1靠右侧出现/-1靠左侧出现)
    this.direction = 1;
    // 随机盒子距离跳台的距离
    this.minDistance = 240;
    this.maxDistance = 400;
    // tanθ角度值
    this.tanAngle = 0.556047197640118;

	// 跳的距离
    this.jumpDistance = 0;
    // 判断是否是按下状态
    this.isReadyJump = false;
    // 落脚点
    this.targetPos;// = new Laya.Point;
    // 左侧跳跃点
    this.leftOrigin = {"x":180,"y":350};
    // 右侧跳跃点
    this.rightOrigin = {"x":505,"y":350};
    this.score = 0;

    // 游戏结束场景  laya可以不用这个
    // this.overPanel = new Laya.Panel();
    // this.overPanel.visible = false;

    // this.rect = new Laya.Sprite();
    // this.rect.graphics.drawRect(0,0,640,Laya.stage.height,'#000');
    // this.overPanel.addChild(this.rect);
    this.overPanel =  new Laya.Dialog();
    // this.overPanel.popup();
    this.overPanel.visible = false;
	this.overPanel.close();
	// this.overPanel.isModal = true;
    UIConfig.popupBgAlpha = 0.6;
    UIConfig.popupBgColor = "rgba(255, 255, 255, 0.8)";
    UIConfig.closeDialogOnSide = false;
    this.label = new Laya.Text();
    this.label.text = "本次得分";
    this.label.y=190;
    this.label.height=0;
    this.label.fontSize=45;
    this.label.align = "center";
    this.overPanel.addChild(this.label);
// this.label.pos(100,50);

    this.overScoreLabel = new Laya.Label();
    this.overScoreLabel.text = "0";
    this.overScoreLabel.y=254.24;
    this.overScoreLabel.height=0;
    this.overScoreLabel.align="center";
    this.overScoreLabel.fontSize=90;
    this.overPanel.addChild(this.overScoreLabel);

    this.restart = new Laya.Image("jump/restart_btn.png");
    // this.restart.pos(168,779.09);
	this.restart.y = 894.15;
    this.restart.align = 'center';
    this.overPanel.addChild(this.restart);
    this.addChild(this.overPanel);
  
    this.init();
	this.reset();
    };
    Laya.class(GameScene,'GameScene',_super)
let _proto =  GameScene.prototype;
   _proto.init = function() {
		this.blockSourceNames = ["jump/block1.png", "jump/block2.png", "jump/block3.png"];
		// 初始化音频
		// this.pushVoice.load('sound/push.mp3');
		// this.jumpVoice.load('sound/jump.mp3');
        //暂时先不弄

		// 添加触摸事件
		this.blockPanel.mouseEnabled = true;//TouchmouseEnabled相当于mouseEnabled on相当于on TOUCH_BEGIN\MOUSE_DOWN,TOUCH_END\MOUSE_UP TOUCH_TAP\CLICK
		this.blockPanel.on(Laya.Event.MOUSE_DOWN, this, this.onKeyDown);
		this.blockPanel.on(Laya.Event.MOUSE_UP, this, this.onKeyUp);
		// 绑定结束按钮
		this.restart.on(Laya.Event.CLICK, this, this.restartHandler);
		// 设置玩家的锚点
		this.player.pivotX = this.player.width / 2
		this.player.pivotY = this.player.height - 20;//Offset pivotX anchorY 
        Laya.timer.frameLoop(1,this,function (){
              let  dt = Laya.timer.delta;
			    dt /= 1000;
			if (this.isReadyJump) {
				this.jumpDistance += 300 * dt;
			}
        });
    };
    _proto.reset = function() {
		// 清空舞台
		this.blockPanel.removeChildren();
        //添加背景
        this.blockPanel.addChild(this.bg);
		this.blockArr = [];
		// 添加一个方块
		let blockNode = this.createBlock();
		blockNode.mouseEnabled = false;
		// 设置方块的起始位置
		blockNode.x = 200;
		blockNode.y = this.height / 2 + blockNode.height;
		this.currentBlock = blockNode;
		// 摆正小人的位置
		this.player.y = this.currentBlock.y;
		this.player.x = this.currentBlock.x;
		this.blockPanel.addChild(this.player);
		this.direction = 1;
		// 添加积分
		this.blockPanel.addChild(this.scoreLabel);
		// 添加下一个方块
		this.addBlock();
	};
    _proto.createBlock = function() {
		var blockNode = null;
		if (this.reBackBlockArr.length) {
			// 回收池里面有,则直接取
			blockNode = this.reBackBlockArr.splice(0, 1)[0];
		} else {
			// 回收池里面没有,则重新创建
			blockNode = new Laya.Image();
		}
		// 使用随机背景图
		let n = Math.floor(Math.random() * this.blockSourceNames.length);
		blockNode.skin= this.blockSourceNames[n];//或者是skin； source 
		blockNode.height =240;
		this.blockPanel.addChild(blockNode);
        
		// 设置方块的锚点
		blockNode.pivotX = 222;
		blockNode.pivotY = 78;//Offset
		// 把新创建的block添加进入blockArr里
		this.blockArr.push(blockNode);
		return blockNode;
	};
    _proto.addBlock = function (){
		// 随机一个方块
		let blockNode = this.createBlock();
		// 设置位置
		let distance = this.minDistance + Math.random() * (this.maxDistance - this.minDistance);
		if (this.direction > 0) {
			blockNode.x = this.currentBlock.x + distance;
			blockNode.y = this.currentBlock.y - distance * this.tanAngle;
		} else {
			blockNode.x = this.currentBlock.x - distance;
			blockNode.y = this.currentBlock.y - distance * this.tanAngle;
		}
		this.currentBlock = blockNode;
	};
    _proto.onKeyDown = function(){
		// 播放按下的音频
		// this.pushSoundChannel = this.pushVoice.play(0, 1);
        
		// 变形
		Laya.Tween.to(this.player,{
			scaleY: 0.5
		}, 3000)
//from(this.player).
		this.isReadyJump = true;
	};
    _proto.onKeyUp = function() {
		// 判断是否是在按下状态
		if (!this.isReadyJump) {
			return;
		}
		// 声明落点坐标
		if (!this.targetPos) {
			this.targetPos = new Laya.Point();
		}
		// 立刻让屏幕不可点,等小人落下后重新可点
		this.blockPanel.mouseEnabled = false;
		// 停止播放按压音频,并且播放弹跳音频
		// this.pushSoundChannel.stop();
		// this.jumpVoice.play(0, 1);
		// 清除所有动画
		Laya.Tween.clearAll(this.player);//removeAllTweens clearAll this.player
		this.blockPanel.addChild(this.player);//这个好像多余了吧
		// 结束跳跃状态
		this.isReadyJump = false;
		// 落点坐标
		this.targetPos.x = this.player.x + this.jumpDistance * this.direction;
		// 根据落点重新计算斜率,确保小人往目标中心跳跃
		this.targetPos.y = this.player.y + this.jumpDistance * (this.currentBlock.y - this.player.y) / (this.currentBlock.x - this.player.x) * this.direction;
		// 执行跳跃动画
        Laya.Tween.to(this,{factor:1,complete:Laya.Handler.create(this,this.onComplet)},500);
		//执行小人空翻动画,update:new Laya.Handler(this,this.factor)
		this.player.pivotY = this.player.height / 2;
		Laya.Tween.to(this.player,{ rotation: this.direction > 0 ? 360 : -360,complete:Laya.Handler.create(this,this.onComple)}, 200);
	};
 _proto.onComplet = function (){
        	this.player.scaleY = 1;
			this.jumpDistance = 0;
			// 判断跳跃是否成功
			this.judgeResult();
        };
 _proto.onComple = function (){
        	this.player.rotation = 0;
            this.player.pivotY = this.player.height - 20;
        }
  _proto.judgeResult = function() {
		// 根据this.jumpDistance来判断跳跃是否成功 this.player.x为跳跃完成后的玩家x坐标；
		if (Math.pow(this.currentBlock.x - this.player.x, 2) + Math.pow(this.currentBlock.y - this.player.y, 2) <= 70 * 70) {
			// 更新积分
			this.score++;
			this.scoreLabel.text = this.score.toString();
			// 随机下一个方块出现的位置
			this.direction = Math.random() > 0.5 ? 1 : -1;
			// 当前方块要移动到相应跳跃点的距离 1右 -1左
			var blockX, blockY;
			blockX = this.direction > 0 ? this.leftOrigin.x : this.rightOrigin.x;
			blockY = this.height / 2 + this.currentBlock.height;
			// 小人要移动到的点.
			var playerX, PlayerY;
			playerX = this.player.x - (this.currentBlock.x - blockX);
			PlayerY = this.player.y - (this.currentBlock.y - blockY);
			// 更新页面
			this.update(this.currentBlock.x - blockX, this.currentBlock.y - blockY);
			// 更新小人的位置
			Laya.Tween.to(this.player,{
				x: playerX,
				y: PlayerY,
                complete:Laya.Handler.create(this,this.onCompl)
			}, 1000)
		} else {
			// 失败,弹出重新开始的panel
			console.log('游戏失败!')
			this.overPanel.visible = true;
			this.overPanel.popup();
			// this.overPanel.show();
			
			this.overScoreLabel.text = this.score.toString();
		}
	};
 _proto.update = function(x, y) {
		Laya.Tween.clearAll(this.player);
		Laya.Tween.clearAll(this);
		for (let i= this.blockArr.length - 1; i >= 0; i--) {
			let blockNode = this.blockArr[i];
			if (blockNode.x + (blockNode.width - 222) < 0 || blockNode.x - 222 > this.width || blockNode.y - 78 > this.height) {
				// 方块超出屏幕,从显示列表中移除
				this.blockPanel.removeChild(blockNode);
				this.blockArr.splice(i, 1);
				// 添加到回收数组中
				this.reBackBlockArr.push(blockNode);
			} else {
				// 没有超出屏幕的话,则移动
				Laya.Tween.to(blockNode,{
					x: blockNode.x - x,
					y: blockNode.y - y
				}, 1000)
			}
		}
	};
    _proto.onCompl = function(){
				// 开始创建下一个方块
				this.addBlock();
				// 让屏幕重新可点;
				this.blockPanel.mouseEnabled = true;
    };
    _proto.restartHandler = function() {
		// 隐藏结束场景
		this.overPanel.visible = false;
        this.overPanel.close();
		// 置空积分
		this.score = 0;
		this.scoreLabel.text = this.score.toString();
		// 开始放置方块
		this.reset();
		// 游戏场景可点
		this.blockPanel.mouseEnabled = true;
	};
	
	 Object.defineProperty(GameScene.prototype, "factor", {
        //添加factor的set,get方法,注意用public  
        get: function () {
            return 0;
        },
        //计算方法参考 二次贝塞尔公式  
        set: function (value) {
            this.player.x = (1 - value) * (1 - value) * this.player.x + 2 * value * (1 - value) * (this.player.x + this.targetPos.x) / 2 + value * value * (this.targetPos.x);
            this.player.y = (1 - value) * (1 - value) * this.player.y + 2 * value * (1 - value) * (this.targetPos.y - 300) + value * value * (this.targetPos.y);
        },
        enumerable: true,
        configurable: true
    });
})(Laya.Component);