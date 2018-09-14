(function(_super){
    function SceneMange(){
        SceneMange.super(this);  
        
      	 this.init();
    };
    Laya.class(SceneMange,'SceneMange',_super);
var _proto = SceneMange.prototype;
    
    _proto.init = function(){
            // 实例化两个场景
            this.beginScene = new BeginScene();
            this.gameScene = new GameScene();
            // 默认添加开始场景
            this.addChild(this.beginScene);
	}
       
    
     SceneMange.changeScene = function (type){
         that = SceneMange.getInstance();
                // 释放资源
                if(type == 'gameScene'){
                    that.beginScene.release();
                }
               // 移除所有显示列表中的对象
                that.removeChildren();
                //添加下一个场景
                that.addChild(that[type]);
    };
     SceneMange.getInstance = function () {
		if(!SceneMange.instance){
			SceneMange.instance = new SceneMange();
		}
		return SceneMange.instance;
	};
})(Laya.Sprite);