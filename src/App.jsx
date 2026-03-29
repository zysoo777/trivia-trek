import { useState } from 'react';

function App() {
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState('17');
  const [questions, setQuestions] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);

  // Convert HTML codes from the API into normal text
  const decodeHtml = (html) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  };

  // Shuffle the answer choices for each question
  const shuffleAnswers = (correct, incorrect) => {
    const allAnswers = [...incorrect, correct];
    return allAnswers.sort(() => Math.random() - 0.5);
  };

  // Start the game and load quiz questions from the API
  const startGame = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`
      );

      const data = await response.json();

      const formattedQuestions = data.results.map((question) => ({
        ...question,
        allAnswers: shuffleAnswers(question.correct_answer, question.incorrect_answers),
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer('');
      setAnswered(false);
      setGameStarted(true);
      setGameOver(false);
    } catch (err) {
      setError('Unable to load questions, please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save the selected answer and update the score if it is correct
  const handleAnswerClick = (answer) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    if (answer === questions[currentQuestionIndex].correct_answer) {
      setScore((prevScore) => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setGameOver(true);
      return;
    }

    setSelectedAnswer('');
    setAnswered(false);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  // Reset the game so the user can play again
  const handleReplay = () => {
    setGameStarted(false);
    setGameOver(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setAnswered(false);
    setError('');
  };

  // Return to the welcome screen and clear the current game
  const handleQuit = () => {
    setGameStarted(false);
    setGameOver(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setAnswered(false);
    setError('');
  };

  const getPercentage = () => {
    return Math.round((score / questions.length) * 100);
  };

  const getMessage = () => {
    const percentage = getPercentage();

    if (percentage === 100) return 'Perfect job!';
    if (percentage >= 80) return 'Great job!';
    if (percentage >= 60) return 'Nice work!';
    if (percentage >= 40) return 'Good effort!';
    return 'Better luck next time!';
  };

  const getRank = () => {
    const percentage = getPercentage();

    if (percentage === 100) return 'Trivia Master';
    if (percentage >= 80) return 'Pro';
    if (percentage >= 60) return 'Intermediate';
    if (percentage >= 40) return 'Learner';
    return 'Novice';
  };

  if (!gameStarted) {
    return (
      <div className="container">
        <h1>Trivia Trek</h1>
        <p>Welcome to the quiz game!</p>
        <p>Select your difficulty and category, then click Start Game.</p>

        <div>
          <label>Difficulty: </label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label>Category: </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="9">General Knowledge</option>
            <option value="17">Science</option>
            <option value="18">Computer Science</option>
            <option value="23">History</option>
            <option value="11">Entertainment</option>
          </select>
        </div>

        <button onClick={startGame}>Start Game</button>

        {loading && <p>Loading questions...</p>}
        {error && <p>{error}</p>}
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="container">
        <h1>Game Over!</h1>
        <p>Your score: {score} / {questions.length}</p>
        <p>Percentage: {getPercentage()}%</p>
        <p>{getMessage()}</p>
        <p>Rank: {getRank()}</p>
        <button onClick={handleReplay}>Play Again</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="container">
      <h2>
        Question {currentQuestionIndex + 1} of {questions.length}
      </h2>

      <p>{decodeHtml(currentQuestion.question)}</p>

      <div>
        {currentQuestion.allAnswers.map((answer, index) => (
          <div key={index}>
            <button onClick={() => handleAnswerClick(answer)} disabled={answered}>
              {decodeHtml(answer)}
            </button>
          </div>
        ))}
      </div>

      {answered && (
        <div>
          {selectedAnswer === currentQuestion.correct_answer ? (
            <p>Correct!</p>
          ) : (
            <p>Wrong! Correct answer: {decodeHtml(currentQuestion.correct_answer)}</p>
          )}
        </div>
      )}

      <div>
        {answered && (
          <button onClick={handleNextQuestion}>
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        )}
        <button className="quit-button" onClick={handleQuit}>Quit</button>
      </div>
    </div>
  );
}

export default App;