"use server";
// Placeholder for server actions - OAuth providers are disabled
// SignIn/SignOut is handled client-side via next-auth/react

export async function signInWithGoogle() {
  throw new Error("Google OAuth is currently disabled");
}

export async function signInWithMicrosoft() {
  throw new Error("Microsoft OAuth is currently disabled");
}

export async function doSignOut() {
  // Use client-side signOut from next-auth/react instead
  throw new Error("Use client-side signOut from next-auth/react");
}
