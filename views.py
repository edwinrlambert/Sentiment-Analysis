# VIEWS
#* Importing dependencies.
from flask import Blueprint, render_template, request, jsonify
from transformers import AutoTokenizer
from transformers import AutoModelForSequenceClassification
from scipy.special import softmax
from newspaper import Article
from decouple import config

# Creating a blueprint for views to use for routing.
views = Blueprint(__name__, "views")

# Import Pre-trained Model for Sentiment Analysis.
SENTIMENT_MODEL = config('SENTIMENT_MODEL','')
CACHE_DIR = config('CACHE_DIR','')

# Model Training for Polarity Scores
tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL, cache_dir=CACHE_DIR)
sentiment_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL, cache_dir=CACHE_DIR)

#* Routing for the Home page.
@views.route("/", methods=['GET', 'POST'])
def home():
    # When a form input is received, show the sentiment based on the input.
    if request.method =='POST':
        response = request.get_json()
        type = response["type"]
        
        # Find input text from different types.
        input = ""
        if (type == "text"):
            input = response["input"]
        elif (type == "url"):
            link = response["input"]
            article = Article(link)
            article.download()
            article.parse()
            article.nlp()
            input = article.text
        elif (type == "media"):
            pass
                
        # Find the sentiment values.
        sentiment_analysis = find_sentiment_analysis(input)
        
        return jsonify(sentiment_analysis)
    # When opening the page, render the webpage.
    elif request.method =='GET':
        return render_template("index.html")
    
#* Find the polarity scores of the input.
def find_sentiment_analysis(input):
    # Find tokenized words.
    encoded_text = tokenizer(input, return_tensors='pt')
    # Find polarity scores.
    output = sentiment_model(**encoded_text)
    scores = output[0][0].detach().numpy()
    scores = softmax(scores)
    
    # Scores
    val_neg = str(scores[0])
    val_neu = str(scores[1])
    val_pos = str(scores[2])
    
    # Find Prominent Sentiment
    if (val_neg >= val_neu) and (val_neg >= val_pos):
       prominent_sentiment = 'NEGATIVE'
    elif (val_neg >= val_neg) and (val_neu >= val_pos):
        prominent_sentiment = 'NEUTRAL'
    else:
        prominent_sentiment = 'POSITIVE'
    
    # Create Sentiment Dictionary.
    sentiment_dict = {
        'score_negative': val_neg,
        'score_neutral': val_neu,
        'score_positive': val_pos,
        'prominent_sentiment': prominent_sentiment
    }
    return sentiment_dict