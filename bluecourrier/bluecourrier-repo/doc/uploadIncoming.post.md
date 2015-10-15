# Description
Ce service web implémenté sous la forme d'un webscript Alfresco permet de réaliser en une opération (dîte transactionnelle) les étapes suivantes :
+ Téléverser un document dans l'entrepôt Alfresco dans un site donné
+ Appliquer les services d'assignation/en copies
+ Définir le type de circuit (avec/sans validation)
+ Lancer éventuellement la distribution

# Signature du service web
Le service web utilise une opération de type <code>POST</code> avec un type de contenu <code>multipart/form-data</code>. Le service répond par défaut sous le format _JSON_.
+ Adresse du service : <code>{SERVEUR}/alfresco/service/bluedolmen/yamma/upload-incoming</code> où <code>{SERVEUR}</code> désigne l'adresse du serveur.
+ Autentification : utilisateur
+ Paramètres :
  - _filedata_ : le contenu à téléverser
  - _siteid_ : le nom du site dans lequel sera déposé le document
  - _containerid_ : le nom du conteneur de site dans lequel sera déposé le document (e.g., <code>documentlibrary</code>)
  - _uploaddirectory_ : le chemin relatif au conteneur dans lequel sera déposé le document (e.g., <code>/Bannettes/Entrant</code>)
  - _targetService_ : le nom (court) du _service_ de destination du document (e.g., _courrier_)
  - _copyServices_ : le nom des services en copie sous la forme d'une liste de noms de service séparée par des virgules (e.g., <code>service1,service2</code>)
  - _copyUsers_ : le nom des utilisateurs en copie sous la forme d'une liste de noms de personnes séparée par des virgules (e.g., <code>user1,user2</code>)
  - _validateDelivery_ (<code>true/false</code>) : définir le type de circuit : avec/sans validation
  - _startDelivery_ (<code>true/false</code>) : définir ou non le démarrage du processus de distribution (passer l'étape de pré-assignation)

# Traitement de la réponse
Le service web répond sous le code HTTP 200 en cas de succès. Le noeud Alfreso créé est retourné sur la forme d'une référence de noeud (_nodeRef_).

	{
	   nodeRef : "workspace:\/\/SpacesStore\/aac73480-3342-4166-a5ea-4854861c409e"
	}
 
Tout autre code supérieur ou égal à 300 désigne une erreur. La réponse JSON comprend un certain nombre d'informations techniques (y compris la trace de la pile d'exécution). 
L'information la plus pertinente se situe au niveau de la réponse <code>status</code>

	status : {
	    "code" : 412,
	    "name" : "Precondition Failed",
	    "description" : "The precondition given in one or more of the request-header fields evaluated to false when it was tested on the server."
	}

En outre, un message plus explicite concernant l'erreur peut être trouvé dans la propriété <code>message</code>

	"message" : "09140010 IllegalStateException! The argument 'targetService' is invalid: The name 'serviceinconnu' does not match any existing service." 

# Exemple avec l'outil *curl*
	curl  --user bpajot:bpajot -F "filedata=@/tmp/document.pdf" -F "siteid=dircom" -F "containerid=documentLibrary" -F "uploaddirectory=/Bannettes/Entrant" -F "targetService=dircom" -F "copyServices=dirlog,dirman" -F "validateDelivery=false" -F "startDelivery=true"
