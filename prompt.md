Help me create an iterative plan for this feature.

Add a new feature to the hamburger menu to play poker. Make this feature the default on the home screen.

At a high level We are going to play poker against robots. These robotic players may play based upon an algorithm or may occasionally show the hand to a prompt and wait for the results on how to play.

As we play, the system will Track our play and give us suggestions on what we should work on to improve our game.

User interface:
Most of the time, we will be on a PC. Later versions will be adapted to allow me to play on the phone. Copy the user interface from popular online poker sites.

Future versions will allow me to set up personas of players I typically play against.

There'll be a config file that'll allow me to determine the structure of the games.

Structure 1:
Title: "Bobs BigO"
9 players dealer sits out
BigO - fixed limit
$4 straddle is allowed.
Stakes:
Blinds 1-2
$4 after the flop, $8 After the next two cards.
Kill:
$6 kill on any scoop pot over $49
Blinds stay $1-$2, but a $6 bring-in. $6 after the flop and $12 after the next two cards.
No straddle on kill pots.

My objective is to play as many hands as possible. If I Don't see the flop, Quickly play out the hand and deal the next hand.

Note the smallest denomination is 50 cents. There is a $1 rake at $20 and another $1 rake at $40.

Note, I always show 3 action buttons same position:  
When there is not bet: Fold (disabled), Check, Bet.
When there is a bet: Fold, Call, Raise.

---

On a kill pot, action still starts after the big blind.
