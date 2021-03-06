import Phaser from 'phaser'

export default class GameStart extends Phaser.Scene {
	constructor() {
		super('game-start')
	}

	create() {
		const {width, height} = this.scale
		this.add
			.text(width * 0.5, height * 0.3, 'Smoosh!', {
				fontSize: '52px',
				color: '#ff0000',
			})
			.setOrigin(0.5)

		const button = this.add
			.rectangle(width * 0.5, height * 0.55, 150, 75, 0xffffff)
			.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
				this.scene.start('game')
			})

		this.add
			.text(button.x, button.y, 'Start Game', {
				color: '#000000',
			})
			.setOrigin(0.5)
	}
}
