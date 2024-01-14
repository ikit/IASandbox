# IASandbox
Bac à sable autour des IA et LLM


## Installation

### OpenAI
Lui c'est facile, à partir du moment où tu payes, tout fonctionne...
Pensez à bien renseigner la clés d'API `OAIK` dans l'environnement

### Mistral, Stable, ...
Pour utiliser d'autres LLM qu'OpenAI, on va utiliser oLLaMa qui est embarqué dans le docker-compose de la solution.

Dans le docker-compose, bien s'assurer que le service `iasandbox_ollama` est bien configuré (normalement y'a rien à faire)

Ensuite dans l'environnement de l'API, vérifier que la clés `OLLAMA_PATH`est bien configuré pour que l'API puisse communiquer avec
le service ollama. Attention, à l'intérieur du réseau Docker Compose, il faut utiliser les noms de service pour communiquer entre les services plutôt que des adresses IP. Ainsi il faudra plutôt renseigner quelque chose du genre: `http://iasandbox_ollama:11434`

Enfin, il faut ajouter le LLM de son choix dans oLLaMa:
 * Voir les modèles disponibles: [https://ollama.ai/library]
 * Exemple pour installer Mistral7B: `sudo docker exec -it iasandbox_ollama ollama run mistral`

Une fois que le modèle est installé, il peut être utilisé directement via le controller `RagMistralController`