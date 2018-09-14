var WebGL  = Laya.WebGL;
Laya.init(640,1136,WebGL);

    (function (){
    function Main(){

        this.runGame();

    };
    Laya.class(Main,'Main');
    Main.prototype = {
        runGame(){
            this.loadResource();
            this.createGameScene();

        },
        loadResource(){
        
        },
        createGameScene(){
           Laya.stage.addChild(SceneMange.getInstance()); //this.addChild();
            //  Laya.stage.addChild(new SceneMange());
        }
    };
})();
new Main();