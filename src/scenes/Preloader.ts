import Phaser from 'phaser'
export default class Preloader extends Phaser.Scene {
	constructor() {
		super('preloader')
	}

	preload() {
		this.load.image('bg', '/assets/backgroundColorForest.png')
		this.load.image('terrain', '/assets/Terrain (16x16).png')
		this.load.tilemapTiledJSON('tilemap', '/assets/tilemap.json')

		this.load.atlas('frog', 'assets/frog.png', 'assets/frog.json')
	}

	create() {
		this.scene.start('game-start')
	}
}
