import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import {events} from '../events/EventCenter'
export default class Game extends Phaser.Scene {
	private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys
	private stateMachine: StateMachine
	private frog!: Phaser.Physics.Arcade.Sprite
	private frogFacing: string
	private isGrounded = false

	constructor() {
		super('game')
		this.stateMachine = new StateMachine(this, 'game')
		this.frogFacing = 'right'
	}

	init() {
		this.cursorKeys = this.input.keyboard.createCursorKeys()
	}

	create() {
		this.scene.launch('game-ui')

		const {width, height} = this.scale
		const cx = width * 0.5
		const cy = height * 0.5

		const bg = this.add.image(cx, cy, 'bg')
		bg.setDisplaySize(width, height)

		// Key should match the name used in tilemapTiledJSON in the Preloader
		const map = this.make.tilemap({key: 'tilemap'})
		// First param is the name of the Tileset in Tiled.
		// Second param is the name you gave the tileset image in the Preloader
		const tileset = map.addTilesetImage('Terrain (16x16)', 'terrain')
		const groundLayer = map.createLayer('ground', tileset)
		groundLayer.setCollisionByProperty({collides: true})

		// this.frog = this.physics.add.sprite(cx, height - 100, 'frog')
		const frogLayer = map.getObjectLayer('frog')
		frogLayer.objects.forEach((objData) => {
			const {x = 0, y = 0, name, width = 0, height = 0} = objData
			switch (name) {
				case 'frog-spawn': {
					this.frog = this.physics.add.sprite(x, y, 'frog')
				}
			}
		})

		this.physics.add.collider(
			this.frog,
			groundLayer,
			this.handleFrogGroundCollision,
			undefined,
			this
		)

		const circle = this.add
			.circle(cx, cy, 75, 0xff0000)
			.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
				this.scene.start('game-over')
			})
		this.add
			.text(circle.x, circle.y, 'die', {
				color: '#000000',
				fontSize: '20px',
			})
			.setOrigin(0.5)

		this.createAnims()
		this.stateMachine
			.addState('idle', {
				onEnter: this.idleOnEnter,
				onUpdate: this.idleOnUpdate,
			})
			.addState('run', {
				onEnter: this.runOnEnter,
				onUpdate: this.runOnUpdate,
				onExit: this.runOnExit,
			})
			.addState('jump', {
				onEnter: this.jumpOnEnter,
				onUpdate: this.jumpOnUpdate,
				onExit: this.jumpOnExit,
			})
			.addState('fall', {
				onEnter: this.fallOnEnter,
				onUpdate: this.fallOnUpdate,
			})
			.setState('idle')
	}

	private handleFrogGroundCollision(frog, ground) {
		const frogBody = this.frog.body as Phaser.Physics.Arcade.Body
		if (!this.isGrounded && frogBody.onFloor()) {
			this.stateMachine.setState('idle')
			this.isGrounded = true
		}
	}

	private idleOnEnter() {
		this.frog.setVelocityX(0)
		this.frog.play('frog-idle')
	}

	private idleOnUpdate() {
		if (this.cursorKeys.left.isDown || this.cursorKeys.right.isDown) {
			this.stateMachine.setState('run')
		}

		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
			this.cursorKeys.space
		)
		if (spaceJustPressed && this.isGrounded) {
			this.stateMachine.setState('jump')
		}
	}

	private runOnEnter() {
		this.frog.play('frog-run')
	}

	private runOnUpdate() {
		const speed = 200

		if (this.cursorKeys.left.isDown) {
			this.frog.flipX = true
			this.frog.setVelocityX(-speed)
			this.frogFacing = 'left'
		} else if (this.cursorKeys.right.isDown) {
			this.frog.flipX = false
			this.frog.setVelocityX(speed)
			this.frogFacing = 'right'
		} else {
			this.frog.setVelocityX(0)
			this.stateMachine.setState('idle')
		}

		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
			this.cursorKeys.space
		)
		if (spaceJustPressed && this.isGrounded) {
			this.stateMachine.setState('jump')
		}
	}

	private runOnExit() {
		this.frog.stop()
	}

	private jumpOnEnter() {
		this.isGrounded = false
		this.frog.play('frog-jump')
		this.frog.setVelocityY(-500)
	}

	private jumpOnUpdate() {
		const speed = 175

		if (this.cursorKeys.left.isDown) {
			this.frog.flipX = true
			this.frog.setVelocityX(-speed)
			this.frogFacing = 'left'
		} else if (this.cursorKeys.right.isDown) {
			this.frog.flipX = false
			this.frog.setVelocityX(speed)
			this.frogFacing = 'right'
		} else {
			this.frog.setVelocityX(0)
		}
	}

	private jumpOnExit() {
		this.isGrounded = false
		this.frog.play('frog-jump')
	}

	private fallOnEnter() {
		this.frog.play('frog-fall')
	}

	private fallOnUpdate() {
		const speed = 200

		if (this.cursorKeys.left.isDown) {
			this.frog.flipX = true
			this.frog.setVelocityX(-speed)
			this.frogFacing = 'left'
		} else if (this.cursorKeys.right.isDown) {
			this.frog.flipX = false
			this.frog.setVelocityX(speed)
			this.frogFacing = 'right'
		} else {
			this.frog.setVelocityX(0)
			this.stateMachine.setState('idle')
		}
	}

	private createAnims() {
		this.frog.anims.create({
			key: 'frog-idle',
			frameRate: 10,
			frames: this.frog.anims.generateFrameNames('frog', {
				start: 1,
				end: 11,
				prefix: 'idle (',
				suffix: ').png',
				zeroPad: 2,
			}),
			repeat: -1,
		})

		this.frog.anims.create({
			key: 'frog-run',
			frameRate: 10,
			frames: this.frog.anims.generateFrameNames('frog', {
				start: 1,
				end: 12,
				prefix: 'run (',
				suffix: ').png',
				zeroPad: 2,
			}),
			repeat: -1,
		})

		this.frog.anims.create({
			key: 'frog-jump',
			frames: [
				{
					key: 'frog',
					frame: 'jump.png',
				},
			],
		})

		this.frog.anims.create({
			key: 'frog-fall',
			frames: [
				{
					key: 'frog',
					frame: 'fall.png',
				},
			],
		})
	}

	update(time: number, delta: number): void {
		this.stateMachine.update(delta)
		events.emit('time-changed', time)
	}
}
