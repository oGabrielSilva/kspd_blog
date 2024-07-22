import { getApp, getApps, initializeApp } from 'firebase/app';
import firebaseConfig from '../../../firebase-config.json';

export class FirebaseApp {
  private static readonly instance = new FirebaseApp();

  private readonly config = firebaseConfig;

  public readonly app = getApps().length > 0 ? getApp() : initializeApp(this.config);

  public static get fast() {
    return FirebaseApp.instance;
  }
}
