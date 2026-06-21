Audio placeholders for the dungeon crawler.

These are intentionally empty 0-byte files so the build works out of the box.
Replace each with a real asset of the same name to enable sound:

Music (looping where noted):
- dungeon_ambient.mp3  (loops, default dungeon music)
- boss_battle.mp3      (loops, plays in Boss Room)
- victory.mp3          (win screen)

SFX:
- footstep.wav, sword_swing.wav, hit.wav, enemy_death.wav, chest_open.wav, door_enter.wav

AudioManager wraps every Howler call in try/catch, so missing or empty files
never crash the game — they simply produce no sound.
