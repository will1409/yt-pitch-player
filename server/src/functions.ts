/**
 * Firebase Cloud Functions entry point.
 * Exporta o Express app como função HTTP chamada "api".
 * O firebase.json redireciona /api/** para esta função.
 */
import * as functions from 'firebase-functions';
import app from './app';

export const api = functions.https.onRequest(app);
