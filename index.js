const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const app = express();

const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require('express-validator');

const cors = require('cors');
// app.use(cors()); // Allow all requests //
let allowedOrigins = ['http://localhost:8080', 'http://myflixfinder.herokuapp.com', 'https://myflixfinder.herokuapp.com', 'mongodb://localhost:27017/myflixfinderdb', 'mongodb://localhost:27017'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//step 1: connects mongodb to my local computer's database//
// mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true});

//step 2: later connect mongodb to heroku db//
// mongoose.connect('mongodb://localhost:27017/myflixfinderdb', { useNewUrlParser: true, useUnifiedTopology: true });

//step 3: connection uri will now not be exposed with this connection//
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });



// morgan middleware function to log requests to terminal//
app.use(morgan('common'));

// directs visits to public foler//
app.use(express.static('public'));

let users = [
  { id: 1,
    name: "Kim",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["The Fountain"]
  }

];

// variable declared for movie list//
let movies = [
  {
    "Title": "E.T",
    "Description": "E.T. is a 1982 American science fiction film produced and directed by Steven Spielberg and written by Melissa Mathison. It tells the story of Elliott, a boy who befriends an extraterrestrial dubbed E.T., who is left behind on Earth.",
    "Genre": {
      "Name": "Drama",
      "Description": "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.[1] Drama of this kind is usually qualified with additional terms that specify its particular super-genre, macro-genre, or micro-genre,[2] such as soap opera, police crime drama, political drama, legal drama, historical drama, domestic drama, teen drama, and comedy-drama (dramedy). These terms tend to indicate a particular setting or subject-matter, or else they qualify the otherwise serious tone of a drama with elements that encourage a broader range of moods. To these ends, a primary element in a drama is the occurrence of conflict—emotional, social, or otherwise—and its resolution in the course of the storyline."
    },
    "Director": {
      "Name": "Steven Spielberg",
      "Bio": "One of the most influential personalities in the history of cinema, Steven Spielberg is Hollywood\'s best known director and one of the wealthiest filmmakers in the world. He has an extraordinary number of commercially successful and critically acclaimed credits to his name, either as a director, producer or writer since launching the summer blockbuster with Jaws (1975), and he has done more to define popular film-making since the mid-1970s than anyone else.",
      "Birth": 1946
    },
    "ImageURL": "https://en.wikipedia.org/wiki/E.T._the_Extra-Terrestrial#/media/File:E_t_the_extra_terrestrial_ver3.jpg",
    "Featured": false
  },

    {
      "Title":"Animal World",
      "Description":"A man finds himself deep in debt and is coerced to board a ship that hosts a risky gambling party.",
      "Genre": {
        "Name":"Action",
        "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats. The genre tends to feature a mostly resourceful hero struggling against incredible odds, which include life-threatening situations, a dangerous villain, or a pursuit which usually concludes in victory for the hero."
      },
      "Director": {
        "Name":"Yan Han",
        "Bio":"We don't have a biography for Yan Han.",
        "Birth":1983
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/0/06/Animal_World_Movie_2018.jpg",
      "Featured":false
    },
    {
      "Title":"Joker",
      "Description":"A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain.",
      "Genre": {
        "Name":"Crime",
        "Description":"Crime fiction, detective story, murder mystery, mystery novel, and police novel are terms used to describe narratives that centre on criminal acts and especially on the investigation, either by an amateur or a professional detective, of a crime, often a murder.[1] It is usually distinguished from mainstream fiction and other genres such as historical fiction or science fiction, but the boundaries are indistinct. Crime fiction has multiple subgenres,[2] including detective fiction (such as the whodunit), courtroom drama, hard-boiled fiction, and legal thrillers. Most crime drama focuses on crime investigation and does not feature the courtroom. Suspense and mystery are key elements that are nearly ubiquitous to the genre."
      },
      "Director": { 
        "Name":"Todd Phillips",
        "Bio":"Todd Phillips is an American filmmaker and actor who got his start by directing the comedy films Road Trip and Old School, the earlier inspired EuroTrip. He also directed Starsky & Hutch, The Hangover trilogy, Due Date, War Dogs and School for Scoundrels. Phillips directed Joker, a Taxi Driver style film set in the universe of Batman and starring Joaquin Phoenix. Joker is the highest grossing R-rated film of all time.",
        "Birth":1970
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg",
      "Featured":false
    },
    {
      "Title": "Pulp Fiction",
      "Description":"The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      "Genre": {
        "Name":"Crime",
        "Description":"Crime fiction, detective story, murder mystery, mystery novel, and police novel are terms used to describe narratives that centre on criminal acts and especially on the investigation, either by an amateur or a professional detective, of a crime, often a murder.[1] It is usually distinguished from mainstream fiction and other genres such as historical fiction or science fiction, but the boundaries are indistinct. Crime fiction has multiple subgenres,[2] including detective fiction (such as the whodunit), courtroom drama, hard-boiled fiction, and legal thrillers. Most crime drama focuses on crime investigation and does not feature the courtroom. Suspense and mystery are key elements that are nearly ubiquitous to the genre."
      },
      "Director": { 
        "Name":"Quentin Tarantino",
        "Bio": "x` At the 1995 Academy Awards, it was nominated for the best picture, best director and best original screenplay. Tarantino and writing partner Roger Avary came away with the award only for best original screenplay. In 1995, Tarantino directed one fourth of the anthology Four Rooms (1995) with friends and fellow auteurs Alexandre Rockwell, Robert Rodriguez and Allison Anders. The film opened December 25 in the United States to very weak reviews. Tarantino's next film was From Dusk Till Dawn (1996), a vampire/crime story which he wrote and co-starred with George Clooney. The film did fairly well theatrically. Since then, Tarantino has helmed several critically and financially successful films, including Jackie Brown (1997), Kill Bill: Vol. 1 (2003), Kill Bill: Vol. 2 (2004), Inglourious Basterds (2009), Django Unchained (2012) and The Hateful Eight (2015).",
        "Birth":1963
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg",
      "Featured":false
    },
    {
      "Title":"Punch-Drunk Love",
      "Description":"Socially frustrated Barry Egan calls a phone-sex line to curb his loneliness. Little does he know it will land him in deep trouble and will jeopardize his burgeoning romance with the mysterious Lena.",
      "Genre": {
        "Name":"Comedy",
        "Description":"Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter, especially in theatre, film, stand-up comedy, television, radio, books, or any other entertainment medium. The term originated in ancient Greece: in Athenian democracy, the public opinion of voters was influenced by political satire performed by comic poets in theaters. The theatrical genre of Greek comedy can be described as a dramatic performance pitting two groups, ages, genders, or societies against each other in an amusing agon or conflict. Northrop Frye depicted these two opposing sides as a 'Society of Youth' and a 'Society of the Old'. A revised view characterizes the essential agon of comedy as a struggle between a relatively powerless youth and the societal conventions posing obstacles to his hopes. In this struggle, the youth then becomes constrained by his lack of social authority, and is left with little choice but to resort to ruses which engender dramatic irony, which provokes laughter."
      },
      "Director": { 
        "Name":"Paul Thomas Anderson",
        "Bio":"Anderson got into film-making at a young age. His most significant amateur film was The Dirk Diggler Story (1988), a sort of mock-documentary a la This Is Spinal Tap (1984), about a once-great pornography star named Dirk Diggler. After enrolling in N.Y.U.'s film program for two days, Anderson got his tuition back and made his own short film, Cigarettes & Coffee (1993). He also worked as a production assistant on numerous commercials and music videos before he got the chance to make his first feature, something he liked to call Sydney, but would later become known to the public as Hard Eight (1996). The film was developed and financed through The Sundance Lab, not unlike Quentin Tarantino's Reservoir Dogs (1992). Anderson cast three actors whom he would continue working with in the future: Altman veteran Philip Baker Hall, the husky and lovable John C. Reilly and, in a small part, Philip Seymour Hoffman, who so far has been featured in all four of Anderson's films. The film deals with a guardian angel type (played by Hall) who takes down-on-his-luck Reilly under his wing. The deliberately paced film featured a number of Anderson trademarks: wonderful use of source light, long takes and top-notch acting. Yet the film was reedited (and retitled) by Rysher Entertainment against Anderson's wishes. It was admired by critics, but didn't catch on at the box office. Still, it was enough for Anderson to eventually get his next movie financed. 'Boogie Nights' was, in a sense, a remake of 'The Dirk Diggler Story', but Anderson threw away the satirical approach and instead painted a broad canvas about a makeshift family of pornographers. The film was often joyous in its look at the 1970s and the days when pornography was still shot on film, still shown in theatres, and its actors could at least delude themselves into believing that they were movie stars. Yet 'Boogie Nights' did not flinch at the dark side, showing a murder and suicide, literally in one (almost) uninterrupted shot, and also showing the lives of these people deteriorate, while also showing how their lives recovered.",
        "Birth":1970
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/6/60/Punch-Drunk_Love_poster.png",
      "Featured":false
    },
    {
      "Title":"Zodiac",
      "Description":"Between 1968 and 1983, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer, an unidentified individual who terrorizes Northern California with a killing spree.",
      "Genre": {
        "Name":"Crime",
        "Description":"Crime fiction, detective story, murder mystery, mystery novel, and police novel are terms used to describe narratives that centre on criminal acts and especially on the investigation, either by an amateur or a professional detective, of a crime, often a murder.[1] It is usually distinguished from mainstream fiction and other genres such as historical fiction or science fiction, but the boundaries are indistinct. Crime fiction has multiple subgenres,[2] including detective fiction (such as the whodunit), courtroom drama, hard-boiled fiction, and legal thrillers. Most crime drama focuses on crime investigation and does not feature the courtroom. Suspense and mystery are key elements that are nearly ubiquitous to the genre."
      },
      "Director": { 
        "Name":"David Fincher",
        "Bio":"David Fincher was born in 1962 in Denver, Colorado, and was raised in Marin County, California. When he was 18 years old he went to work for John Korty at Korty Films in Mill Valley. He subsequently worked at ILM (Industrial Light and Magic) from 1981-1983. Fincher left ILM to direct TV commercials and music videos after signing with N. Lee Lacy in Hollywood. He went on to found Propaganda in 1987 with fellow directors Dominic Sena, Greg Gold and Nigel Dick. Fincher has directed TV commercials for clients that include Nike, Coca-Cola, Budweiser, Heineken, Pepsi, Levi's, Converse, AT&T and Chanel. He has directed music videos for Madonna, Sting, The Rolling Stones, Michael Jackson, Aerosmith, George Michael, Iggy Pop, The Wallflowers, Billy Idol, Steve Winwood, The Motels and, most recently, A Perfect Circle. As a film director, he has achieved huge success with Se7en (1995), Fight Club (1999) and, Panic Room (2002).",
        "Birth":1962
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/3/3a/Zodiac2007Poster.jpg",
      "Featured":false
    },
    {
      "Title":"The Double",
      "Description":"The unenviable life of a government-agency clerk takes a horrific turn with the arrival of a new co-worker who is both his exact physical double and his opposite otherwise--he's a confident, charismatic ladies' man.",
      "Genre": {
        "Name":"Comedy",
        "Description": "Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter, especially in theatre, film, stand-up comedy, television, radio, books, or any other entertainment medium. The term originated in ancient Greece: in Athenian democracy, the public opinion of voters was influenced by political satire performed by comic poets in theaters. The theatrical genre of Greek comedy can be described as a dramatic performance pitting two groups, ages, genders, or societies against each other in an amusing agon or conflict. Northrop Frye depicted these two opposing sides as a 'Society of Youth' and a 'Society of the Old'. A revised view characterizes the essential agon of comedy as a struggle between a relatively powerless youth and the societal conventions posing obstacles to his hopes. In this struggle, the youth then becomes constrained by his lack of social authority, and is left with little choice but to resort to ruses which engender dramatic irony, which provokes laughter."
      },
      "Director": { 
        "Name":"Richard Ayoade",
        "Bio":"Ayoade's first real TV break was directing, co-writing and starring with Matthew Holness in the cult classic Garth Marenghi's Darkplace (2004) a parody of shlocky 1980's science fiction television shows, and noticed for it's 'so bad it's good!' aesthetic. Notably shy and self-effacing in interviews, his performance as the debauched, self-assured publisher/pornographer/nightclub owner 'Dean Learner' showcased the young comedian's acting talent. After cameos in another cult series The Mighty Boosh (2003) as the shaman 'Saboo', his position in the popular consciousness was cemented in the series The IT Crowd (2006) where Ayoade played the social oblivious, dweebish savant known as 'Moss'. All the while Ayoade continued to direct music videos for Vampire Weekend, Kasabian, and the Yeah, Yeah, Yeahs before finally getting his chance to direct a feature film, Submarine (2010), based on the novel by Joe Dunthorne. Submarine was followed by The Double (2013) co-written by Avi Korine and based on a novel by Fyodor Dostoevsky.",
        "Birth":1977
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/thumb/4/43/TheDouble2013Poster.jpg/330px-TheDouble2013Poster.jpg",
      "Featured":false
    },
    {
      "Title":"The Big Lebowski",
      "Description":"Ultimate L.A. slacker Jeff 'The Dude' Lebowski, mistaken for a millionaire of the same name, seeks restitution for a rug ruined by debt collectors, enlisting his bowling buddies for help while trying to find the millionaire's missing wife.",
      "Genre": {
        "Name":"Comedy",
        "Description":"Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter, especially in theatre, film, stand-up comedy, television, radio, books, or any other entertainment medium. The term originated in ancient Greece: in Athenian democracy, the public opinion of voters was influenced by political satire performed by comic poets in theaters. The theatrical genre of Greek comedy can be described as a dramatic performance pitting two groups, ages, genders, or societies against each other in an amusing agon or conflict. Northrop Frye depicted these two opposing sides as a 'Society of Youth' and a 'Society of the Old'. A revised view characterizes the essential agon of comedy as a struggle between a relatively powerless youth and the societal conventions posing obstacles to his hopes. In this struggle, the youth then becomes constrained by his lack of social authority, and is left with little choice but to resort to ruses which engender dramatic irony, which provokes laughter."
      },
      "Director": { 
        "Name":"Joel Coen",
        "Bio":"Joel Daniel Coen is an American filmmaker who regularly collaborates with his younger brother Ethan. They made Raising Arizona, Barton Fink, Fargo, The Big Lebowski, True Grit, O Brother Where Art Thou?, Burn After Reading, A Serious Man, Inside Llewyn Davis, Hail Caesar and other projects. Joel married actress Frances McDormand in 1984 and had an adopted son.",
        "Birth":1954
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/3/35/Biglebowskiposter.jpg",
      "Featured":false
    },
    {
      "Title":"Amélie",
      "Description":"Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.",
      "Genre": {
        "Name":"Comedy",
        "Description":"Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter, especially in theatre, film, stand-up comedy, television, radio, books, or any other entertainment medium. The term originated in ancient Greece: in Athenian democracy, the public opinion of voters was influenced by political satire performed by comic poets in theaters. The theatrical genre of Greek comedy can be described as a dramatic performance pitting two groups, ages, genders, or societies against each other in an amusing agon or conflict. Northrop Frye depicted these two opposing sides as a 'Society of Youth' and a 'Society of the Old'. A revised view characterizes the essential agon of comedy as a struggle between a relatively powerless youth and the societal conventions posing obstacles to his hopes. In this struggle, the youth then becomes constrained by his lack of social authority, and is left with little choice but to resort to ruses which engender dramatic irony, which provokes laughter."
      },
      "Director": { 
        "Name":"Jean-Pierre Jeunet",
        "Bio":"Jean-Pierre Jeunet is a self-taught director who was very quickly interested by cinema, with a predilection for a fantastic cinema where form is as important as the subject. Thus he started directing TV commercials and video clips (such as Julien Clerc in 1984). At the same time he met designer/drawer Marc Caro with whom he made two short animation movies: L'évasion (1978) and Le manège (1981), the latter winning a César for the best short movie. After these two successful movies Jeunet and Caro spent more than one year together by making every detail (scenario, costumes, production design) of their third short movie: The Bunker of the Last Gunshots (1993). This movie combined sci-fi and heroic-fantasy in a visually delirious story of the rising paranoia among soldiers trapped underground. With that movie they garnered several festival prizes in France. (This movie also marked their first collaboration with Gilles Adrien who later wrote the story of their two feature movies with them). After that Jeunet directed two other short movies without the help of Caro: Pas de repos pour Billy Brakko (1984), then Things I Like, Things I Don't Like (1989) with Dominique Pinon who became another regular collaborator of Jeunet. All Jeunet's short movies won a lot of awards in France but also overseas and he won a second César with Things I Like, Things I Don't Like (1989).",
        "Birth":1953
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/5/53/Amelie_poster.jpg",
      "Featured":false
    },
    {
      "Title":"Saving Private Ryan",
      "Description":"Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.",
      "Genre": {
        "Name":"Drama",
        "Description":"In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.[1] Drama of this kind is usually qualified with additional terms that specify its particular super-genre, macro-genre, or micro-genre,[2] such as soap opera, police crime drama, political drama, legal drama, historical drama, domestic drama, teen drama, and comedy-drama (dramedy). These terms tend to indicate a particular setting or subject-matter, or else they qualify the otherwise serious tone of a drama with elements that encourage a broader range of moods. To these ends, a primary element in a drama is the occurrence of conflict—emotional, social, or otherwise—and its resolution in the course of the storyline."
      },
      "Director": { 
        "Name":"Steven Spielberg",
        "Bio":"One of the most influential personalities in the history of cinema, Steven Spielberg is Hollywood's best known director and one of the wealthiest filmmakers in the world. He has an extraordinary number of commercially successful and critically acclaimed credits to his name, either as a director, producer or writer since launching the summer blockbuster with Jaws (1975), and he has done more to define popular film-making since the mid-1970s than anyone else.",
        "Birth":1946
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/a/ac/Saving_Private_Ryan_poster.jpg",
      "Featured":false
    },
    {
      "Title":"Newsies",
      "Description":"A musical based on the New York City newsboy strike of 1899. When young newspaper sellers are exploited beyond reason by their bosses they set out to enact change and are met by the ruthlessness of big business.",
      "Genre": {
        "Name":"Drama",
        "Description":"In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.[1] Drama of this kind is usually qualified with additional terms that specify its particular super-genre, macro-genre, or micro-genre,[2] such as soap opera, police crime drama, political drama, legal drama, historical drama, domestic drama, teen drama, and comedy-drama (dramedy). These terms tend to indicate a particular setting or subject-matter, or else they qualify the otherwise serious tone of a drama with elements that encourage a broader range of moods. To these ends, a primary element in a drama is the occurrence of conflict—emotional, social, or otherwise—and its resolution in the course of the storyline."
      },
      "Director": { 
        "Name":"Kenny Ortega",
        "Bio":"Kenny Ortega was born on April 18, 1950 in Palo Alto, California, USA. He is known for Hull High (1990), XIX Winter Olympics Opening Ceremony (2002) and High School Musical 3: Senior Year (2008).",
        "Birth":1950
      },
      "ImageURL":"https://upload.wikimedia.org/wikipedia/en/5/53/Newsies-Poster.jpg",
      "Featured":false
    }
   
];

// CREATE //

// CREATE //
app.post('/users', // Validation logic here for request
//you can either use a chain of methods like .not().isEmpty()
//which means "opposite of isEmpty" in plain english "is not empty"
//or use .isLength({min: 5}) which means
//minimum value of 5 characters are only allowed
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
    .then((user) => {
      if (user) {
      //If the user is found, send a response that it already exists
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// READ //
app.get('/', (req, res) => {
  res.status(200).json('Thank you for visiting my API!');
});

app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  // checking..temporarily moved middleware for exercise 3.4..test edit//
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({Title: req.params.Title })
    .then((movie) => {
      
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get('/movies/genres/:Genre', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Genre.Name": req.params.Genre })
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Error: ' + err);
    })
});

// Returns the description of a Genre (of the first one found)
app.get('/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ genreName: req.params.Genre })
    .then((movie) => {
      res.send(movie.Genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Error: ' + err);
    })
});

app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
   Movies.findOne({ directorName: req.params.directorName })
  .then((movie) => {
    res.json(movie.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// UPDATE //

app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
      FavoriteMovies: req.body.FavoriteMovies
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
      res.json(updatedUser);
    }
  });
});

// DELETE//
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, 
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });






// Error handling middleware function//
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});