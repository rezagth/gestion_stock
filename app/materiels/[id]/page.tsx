'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Materiel, Installation } from '@prisma/client';
import { FaTools, FaBuilding, FaFileInvoice, FaArrowLeft } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from "@/components/ui/skeleton";

type MaterielWithDetails = Materiel & {
    installation: Installation;
};

const MaterielDetail: React.FC = () => {
    const { id } = useParams();
    const [materiel, setMateriel] = useState<MaterielWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterielDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/materiels/${encodeURIComponent(id as string)}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setMateriel(data);
                toast.success('Détails du matériel chargés avec succès !');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue";
                setError(errorMessage);
                toast.error(`Erreur : ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaterielDetails();
    }, [id]);

    if (isLoading) return <LoadingSkeleton />;
    if (error) return <div className="text-red-600 text-center mt-12 p-4 bg-red-100 rounded-lg">{error}</div>;
    if (!materiel) return <div className="text-center mt-12 text-gray-600">Matériel non trouvé</div>;

    return (
        <div className="max-w-4xl mx-auto my-12 px-4">
            <Link href="/suivi" className="inline-block mb-6">
                <Button variant="outline" className="flex items-center text-blue-600 hover:bg-blue-50 transition-colors">
                    <FaArrowLeft className="mr-2" /> Retour à la liste
                </Button>
            </Link>
            
            <Card className="shadow-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-white">
                <div className="px-6 py-8 bg-blue-600 text-white">
                    <h1 className="text-4xl font-bold">{materiel.typeMateriel}</h1>
                    <p className="mt-2 text-blue-200">Détails du matériel</p>
                </div>
                
                <div className="p-8 space-y-10">
                    {/* Informations du Matériel */}
                    <Section title="Détails du Matériel" icon={<FaTools />}>
                        <InfoGrid>
                            <InfoItem label="Marque" value={materiel.marque} />
                            <InfoItem label="Modèle" value={materiel.modele} />
                            <InfoItem label="N° série" value={materiel.numeroSerie} />
                            <InfoItem label="Date d'installation" value={new Date(materiel.dateInstallation).toLocaleDateString()} />
                        </InfoGrid>
                    </Section>

                    {/* Informations de l'Installation */}
                    <Section title="Détails de l'Installation" icon={<FaBuilding />}>
                        <InfoGrid>
                            <InfoItem label="Nom" value={materiel.installation.nom} />
                            <InfoItem label="Client" value={materiel.installation.client} />
                            <InfoItem label="Organisation" value={materiel.installation.organisation} />
                            <InfoItem label="Boutique" value={materiel.installation.boutique} />
                        </InfoGrid>
                    </Section>

                    {/* Informations de Facturation */}
                    <Section title="Informations de Facturation" icon={<FaFileInvoice />}>
                        <InfoGrid>
                            <InfoItem label="N° Facture" value={materiel.installation.numeroFacture || 'Non spécifié'} />
                            <InfoItem label="Date Facture" value={materiel.installation.dateFacture ? new Date(materiel.installation.dateFacture).toLocaleDateString() : 'Non spécifiée'} />
                        </InfoGrid>
                    </Section>
                </div>
            </Card>

            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <section className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-semibold mb-6 flex items-center text-blue-700">
            <span className="mr-3 text-blue-500">{icon}</span> {title}
        </h2>
        {children}
    </section>
);

const InfoGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 gap-6">
        {children}
    </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-gray-50 p-3 rounded-md">
        <span className="font-medium text-gray-600">{label}:</span>
        <span className="ml-2 text-gray-800">{value}</span>
    </div>
);

const LoadingSkeleton: React.FC = () => (
    <div className="max-w-4xl mx-auto my-12 px-4">
        <Skeleton className="w-32 h-10 mb-6" /> {/* Bouton de retour */}
        
        <Card className="shadow-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-white">
            <div className="px-6 py-8 bg-blue-600">
                <Skeleton className="w-3/4 h-10 mb-2" /> {/* Titre */}
                <Skeleton className="w-1/2 h-6" /> {/* Sous-titre */}
            </div>
            
            <div className="p-8 space-y-10">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                        <Skeleton className="w-1/3 h-8 mb-6" /> {/* Titre de section */}
                        <div className="grid grid-cols-2 gap-6">
                            {[...Array(4)].map((_, itemIndex) => (
                                <div key={itemIndex} className="bg-gray-50 p-3 rounded-md">
                                    <Skeleton className="w-full h-6" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);

export default MaterielDetail;