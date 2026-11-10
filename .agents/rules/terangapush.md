# Règle TeragaPush / TerangaPush

Lorsque l'utilisateur envoie le message **"TeragaPush"** (ou **"TerangaPush"**) :
1. Se positionner dans le dossier du dépôt git : `teranga-app`.
2. Vérifier l'état git (`git status`).
3. Si des modifications sont en cours, les ajouter (`git add .`) et créer un commit clair résumant les derniers changements apportés.
4. Effectuer un `git push` vers le remote correspondant sur la branche courante (ex: `git push origin develop` ou la branche active).
5. Confirmer à l'utilisateur le statut du push avec le hash du commit et la branche ciblée.
