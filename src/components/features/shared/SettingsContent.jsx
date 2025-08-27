import {useState} from 'react';
import {Settings, Shield, Database, FileText, Info, ArrowLeft} from 'lucide-react';

export default function SettingsContent() {
    const [activeTab, setActiveTab] = useState('privacy');
    const [activePolicy, setActivePolicy] = useState(null);

    const tabs = [{id: 'privacy', label: 'Confidentialité', icon: Shield}, {
        id: 'policies',
        label: 'Politiques',
        icon: FileText
    }, {id: 'data', label: 'Données', icon: Database}, {id: 'about', label: 'À propos', icon: Info}];

    // Contenu des politiques
    const policies = {
        privacy: {
            title: "Politique de confidentialité", content: `
                <h2 class="text-xl font-bold mb-4">Politique de confidentialité</h2>
                <p class="mb-3">Dernière mise à jour: 29 juillet 2025</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">1. Introduction</h3>
                <p class="mb-3">Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre service.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">2. Collecte d'informations</h3>
                <p class="mb-3">Nous collectons les informations que vous nous fournissez directement, comme votre nom et votre email lors de la création de votre compte.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">3. Utilisation des cookies</h3>
                <p class="mb-3">Nous utilisons uniquement des cookies essentiels pour stocker vos préférences et maintenir votre session. Ces cookies sont nécessaires au bon fonctionnement du service.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">4. Partage d'informations</h3>
                <p class="mb-3">Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins commerciales.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">5. Sécurité des données</h3>
                <p class="mb-3">Nous prenons des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">6. Vos droits</h3>
                <p class="mb-3">Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles à tout moment.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">7. Contact</h3>
                <p class="mb-3">Pour toute question concernant cette politique, veuillez nous contacter à privacy@example.com.</p>
            `
        }, terms: {
            title: "Conditions d'utilisation", content: `
                <h2 class="text-xl font-bold mb-4">Conditions d'utilisation</h2>
                <p class="mb-3">Dernière mise à jour: 29 juillet 2025</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">1. Acceptation des conditions</h3>
                <p class="mb-3">En utilisant notre service, vous acceptez de vous conformer à ces conditions d'utilisation et de les respecter.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">2. Description du service</h3>
                <p class="mb-3">Notre service permet aux utilisateurs de [description de votre service].</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">3. Comptes utilisateurs</h3>
                <p class="mb-3">Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">4. Contenu de l'utilisateur</h3>
                <p class="mb-3">Vous conservez tous les droits sur le contenu que vous soumettez, publiez ou affichez sur notre service.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">5. Comportement interdit</h3>
                <p class="mb-3">Vous ne devez pas utiliser le service à des fins illégales ou non autorisées.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">6. Modification des conditions</h3>
                <p class="mb-3">Nous nous réservons le droit de modifier ces conditions à tout moment.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">7. Résiliation</h3>
                <p class="mb-3">Nous pouvons résilier ou suspendre votre compte à tout moment pour violation des conditions.</p>
            `
        }, cookies: {
            title: "Politique des cookies", content: `
                <h2 class="text-xl font-bold mb-4">Politique des cookies</h2>
                <p class="mb-3">Dernière mise à jour: 29 juillet 2025</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">1. Qu'est-ce qu'un cookie?</h3>
                <p class="mb-3">Un cookie est un petit fichier texte stocké sur votre navigateur qui permet au site web de mémoriser vos préférences.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">2. Comment nous utilisons les cookies</h3>
                <p class="mb-3">Nous utilisons uniquement des cookies essentiels pour:</p>
                <ul class="list-disc pl-6 mb-3">
                    <li>Mémoriser votre session de connexion</li>
                    <li>Enregistrer vos préférences de base</li>
                    <li>Assurer le fonctionnement technique du site</li>
                </ul>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">3. Types de cookies utilisés</h3>
                <p class="mb-3">Cookies de session: Ces cookies sont temporaires et expirent lorsque vous fermez votre navigateur.</p>
                <p class="mb-3">Cookies persistants: Ces cookies restent dans votre navigateur jusqu'à ce qu'ils expirent ou que vous les supprimiez.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">4. Contrôle des cookies</h3>
                <p class="mb-3">Vous pouvez contrôler et/ou supprimer les cookies à votre guise. Vous pouvez supprimer tous les cookies déjà présents sur votre ordinateur et configurer la plupart des navigateurs pour qu'ils les bloquent.</p>
            `
        }, gdpr: {
            title: "RGPD et droits des utilisateurs", content: `
                <h2 class="text-xl font-bold mb-4">RGPD et droits des utilisateurs</h2>
                <p class="mb-3">Dernière mise à jour: 29 juillet 2025</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">1. Vos droits selon le RGPD</h3>
                <p class="mb-3">Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants:</p>
                <ul class="list-disc pl-6 mb-3">
                    <li><strong>Droit d'accès:</strong> Vous avez le droit d'accéder à vos données personnelles.</li>
                    <li><strong>Droit de rectification:</strong> Vous pouvez demander la correction de vos données inexactes.</li>
                    <li><strong>Droit à l'effacement:</strong> Vous pouvez demander la suppression de vos données dans certaines conditions.</li>
                    <li><strong>Droit à la limitation du traitement:</strong> Vous pouvez demander la limitation du traitement de vos données.</li>
                    <li><strong>Droit à la portabilité:</strong> Vous pouvez demander le transfert de vos données à un autre service.</li>
                    <li><strong>Droit d'opposition:</strong> Vous pouvez vous opposer au traitement de vos données.</li>
                </ul>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">2. Comment exercer vos droits</h3>
                <p class="mb-3">Pour exercer l'un de ces droits, veuillez nous contacter à privacy@example.com ou utiliser les fonctionnalités de suppression de compte dans les paramètres.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">3. Délai de réponse</h3>
                <p class="mb-3">Nous nous efforçons de répondre à toutes les demandes légitimes dans un délai d'un mois.</p>
                
                <h3 class="text-lg font-semibold mt-6 mb-2">4. Autorité de contrôle</h3>
                <p class="mb-3">Vous avez le droit de déposer une plainte auprès d'une autorité de contrôle de la protection des données.</p>
            `
        }
    };

    const renderContent = () => {
        // Si une politique est active, afficher son contenu
        if (activePolicy) {
            return (<div className="space-y-6">
                    <button
                        onClick={() => setActivePolicy(null)}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/> Retour aux politiques
                    </button>
                    <div
                        className="policy-content prose prose-blue max-w-none"
                        dangerouslySetInnerHTML={{__html: policies[activePolicy].content}}
                    />
                </div>);
        }

        // Sinon, afficher le contenu normal de l'onglet
        switch (activeTab) {
            case 'privacy':
                return (<div className="space-y-6">
                        <h4 className="font-medium text-gray-900 mb-3">Préférences de cookies</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <h5 className="font-medium text-gray-800">Cookies essentiels</h5>
                                    <p className="text-sm text-gray-500">Nécessaires au fonctionnement du site</p>
                                </div>
                                <button
                                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-not-allowed">
                                    <span
                                        className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform"/>
                                </button>
                            </div>
                        </div>
                    </div>);

            case 'data':
                return (<div className="space-y-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Exportation des données</h4>
                            <p className="text-sm text-gray-600 mb-4">Téléchargez toutes vos données en format JSON</p>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Exporter mes données
                            </button>
                        </div>
                        <div className="border-t pt-6">
                            <h4 className="font-medium text-red-600 mb-3">Zone dangereuse</h4>
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <h5 className="font-medium text-red-800 mb-2">Supprimer le compte</h5>
                                <p className="text-sm text-red-600 mb-3">Cette action est irréversible. Toutes vos
                                    données seront supprimées.</p>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                                    Supprimer définitivement
                                </button>
                            </div>
                        </div>
                    </div>);

            case 'policies':
                return (<div className="space-y-6">
                        <div className="space-y-3">
                            <button
                                onClick={() => setActivePolicy('privacy')}
                                className="block w-full text-left p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Politique de confidentialité</h4>
                                        <p className="text-sm text-gray-500">Comment nous utilisons vos données</p>
                                    </div>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActivePolicy('terms')}
                                className="block w-full text-left p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Conditions d'utilisation</h4>
                                        <p className="text-sm text-gray-500">Règles d'utilisation de notre service</p>
                                    </div>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActivePolicy('cookies')}
                                className="block w-full text-left p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Politique des cookies</h4>
                                        <p className="text-sm text-gray-500">Comment nous utilisons les cookies</p>
                                    </div>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActivePolicy('gdpr')}
                                className="block w-full text-left p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-900">RGPD et droits des utilisateurs</h4>
                                        <p className="text-sm text-gray-500">Vos droits selon le RGPD</p>
                                    </div>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>);

            case 'about':
                return (<div className="space-y-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Version de l'application</h4>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm font-mono">v1.2.3</p>
                                <p className="text-sm text-gray-600 mt-1">Dernière mise à jour : 29 juillet 2025</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Support</h4>
                            <div className="space-y-3">
                                <a href="/help"
                                   className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Centre d'aide</span>
                                        <span className="text-blue-600">→</span>
                                    </div>
                                </a>
                                <a href="/contact"
                                   className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Nous contacter</span>
                                        <span className="text-blue-600">→</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="border-t pt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Crédits</h4>
                            <p className="text-sm text-gray-600">
                                Développé avec ❤️ par l'équipe.<br/>
                                Icônes par Lucide, UI par Tailwind CSS.
                            </p>
                        </div>
                    </div>);

            default:
                return (<div className="text-center py-8">
                        <p className="text-gray-500">Section en développement</p>
                    </div>);
        }
    };

    return (<div className="p-4 ">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6"/>
                    Paramètres
                </h1>
                <p className="text-gray-600 mt-1">Gérez vos préférences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar - cacher si une politique est affichée sur mobile */}
                <div className={`lg:w-64 flex-shrink-0 ${activePolicy ? 'hidden lg:block' : ''}`}>
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (<button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setActivePolicy(null);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <Icon className="w-4 h-4"/>
                                    {tab.label}
                                </button>);
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        {renderContent()}

                        {/* Action buttons - ne pas afficher si une politique est affichée */}
                        {!activePolicy && (<div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                    Sauvegarder
                                </button>
                            </div>)}
                    </div>
                </div>
            </div>
        </div>);
}