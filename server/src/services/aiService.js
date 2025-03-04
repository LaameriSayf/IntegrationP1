const tf = require('@tensorflow/tfjs');

let model;

// Entraîner le modèle
const trainModel = async (data) => {
  try {
    if (data.length === 0) {
      console.error("Aucune donnée pour l'entraînement");
      return;
    }

    const inputs = tf.tensor(data.map(d => d.input));
    const outputs = tf.tensor(data.map(d => d.output));

    model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [1], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    await model.fit(inputs, outputs, { epochs: 50 });

    console.log('Modèle entraîné avec succès');
  } catch (error) {
    console.error("Erreur entraînement:", error);
  }
};

// Prédire une transaction future
const predict = (inputData) => {
  if (!model) {
    throw new Error("Le modèle n'est pas encore entraîné");
  }

  const tensorInput = tf.tensor([inputData]);
  const prediction = model.predict(tensorInput).dataSync()[0];

  return prediction;
};

module.exports = { trainModel, predict };
