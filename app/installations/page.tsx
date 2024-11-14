'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Installation, Materiel } from '@prisma/client';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type InstallationWithDetails = Installation & { materiels: Materiel[]; };

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<InstallationWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrgs, setExpandedOrgs] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const response = await fetch('/api/installations');
        if (!response.ok) {
          throw new Error('Échec de la récupération des installations');
        }
        const data = await response.json();
        setInstallations(data);
      } catch (err) {
        setError("Erreur lors du chargement des installations");
        toast.error("Erreur lors du chargement des installations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstallations();
  }, []);

  const filteredInstallations = useMemo(() => {
    return installations.filter(installation =>
      installation.materiels.some(materiel =>
        materiel.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      installation.numeroFacture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.boutique?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.organisation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [installations, searchTerm]);

  const groupedInstallations = useMemo(() => {
    const groups: { [key: string]: InstallationWithDetails[] } = {};
    filteredInstallations.forEach(installation => {
      const org = installation.organisation || 'Sans organisation';
      if (!groups[org]) {
        groups[org] = [];
      }
      groups[org].push(installation);
    });
    return groups;
  }, [filteredInstallations]);

  const toggleOrg = (org: string) => {
    setExpandedOrgs(prev => ({ ...prev, [org]: !prev[org] }));
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <div className="grid grid-cols-1 gap-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6 bg-white border rounded-lg shadow-lg">
            <Skeleton className="h-6 mb-4" />
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-4 mb-2" />
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Liste des Installations</h1>
        <Link href="/installations/nouvelle" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md text-center w-full sm:w-auto">
          Nouvelle Installation
        </Link>
      </div>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher par nom, numéro de série, numéro de facture ou boutique"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>
      {Object.keys(groupedInstallations).length === 0 ? (
        <Card className="text-gray-500 text-center text-lg bg-white p-8 rounded-lg shadow">Aucune installation trouvée.</Card>
      ) : (
        Object.entries(groupedInstallations).map(([org, orgInstallations]) => (
          <Card key={org} className="mb-6 bg-white border rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-100 flex justify-between items-center cursor-pointer" onClick={() => toggleOrg(org)}>
              <h2 className="text-xl font-semibold text-gray-800">{org}</h2>
              {expandedOrgs[org] ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedOrgs[org] && (
              <div className="p-4">
                {orgInstallations.map((installation) => (
                  <div key={installation.id} className="mb-4 last:mb-0 p-4 bg-white rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{installation.nom}</h3>
                      <Link 
                        href={`/installations/${installation.id}/edit`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                      >
                        Modifier
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                      <div>
                        <p className="text-gray-600"><span className="font-medium text-gray-700">Organisation:</span> {installation.organisation || 'Non spécifiée'}</p>
                        <p className="text-gray-600"><span className="font-medium text-gray-700">Client:</span> {installation.client}</p>
                        <p className="text-gray-600"><span className="font-medium text-gray-700">Boutique:</span> {installation.boutique}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><span className="font-medium text-gray-700">Numéro de Facture:</span> {installation.numeroFacture || 'Non spécifié'}</p>
                        <p className="text-gray-600"><span className="font-medium text-gray-700">Date de Facture:</span> {installation.dateFacture ? new Date(installation.dateFacture).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                        <p className="text-gray-600"><span className="font-medium text-gray-700">Date de création:</span> {new Date(installation.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    {installation.materiels && installation.materiels.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Matériels:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                          {installation.materiels.map((materiel) => (
                            <Link key={materiel.id} href={`/materiels/${materiel.id}`}>
                              <div className="bg-blue-50 p-4 rounded-md shadow-md hover:shadow-lg transition duration-300 cursor-pointer">
                                <p className="font-bold text-lg text-blue-600">{materiel.marque} {materiel.modele}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {materiel.typeMateriel}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">S/N:</span> {materiel.numeroSerie}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Installé le:</span> {new Date(materiel.dateInstallation).toLocaleDateString('fr-FR')}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}