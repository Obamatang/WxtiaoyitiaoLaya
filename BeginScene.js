(function(_super){
    // 开始按钮
	// public beginBtn:eui.Button;
    //配置皮肤；
    // let SceneMangeOne = new SceneMange();
    function BeginScene(){
      BeginScene.super(this);
         this.bg = new Laya.Sprite();
         this.addChild(this.bg);
         this.bg.loadImage("jump/bg.jpg");

         this.beginBtn =new Laya.Sprite();//配置皮肤以及位置；jump/start_btn_png
         this.beginBtn.loadImage("jump/start_btn.png");
         this.addChild(this.beginBtn);
         this.beginBtn.pos(168,779.09);

        this.init();
    };
    Laya.class(BeginScene,'BeginScene',_super);
    var _proto = BeginScene.prototype
    _proto.init = function(){
            this.beginBtn.on(Laya.Event.CLICK,this,this.tapHandler)
        },
    _proto.tapHandler = function(){
		// 切换场景.getInstance()
	       SceneMange.changeScene('gameScene');
	    },
    _proto.release= function(){
		if(this.beginBtn.hasListener(Laya.Event.CLICK)){
			this.beginBtn.off(Laya.Event.CLICK,this,this.tapHandler);
		    }
        }
    
})(Laya.Sprite);//