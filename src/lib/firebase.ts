// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyA5ZfOBfX5cZrDrDRHssLBlCaGx0JjcPMQ",
  authDomain: "git-ai.firebaseapp.com",
  projectId: "git-ai",
  storageBucket: "git-ai.firebasestorage.app",
  messagingSenderId: "869630617609",
  appId: "1:869630617609:web:fc56268d386f90e3a370d8",
  measurementId: "G-K593H2J76S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFile(
  file: File,
  setProgress?: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          if (setProgress) setProgress(progress);

          switch (snapshot.state) {
            case "paused":
              console.log("upload is paused");
              break;
            case "running":
              console.log("upload is running");
              break;
          }
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            resolve(downloadUrl as string);
          });
        },
      );
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
