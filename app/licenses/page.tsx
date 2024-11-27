'use client';

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface License {
  typeLicense: string;
  description: string;
}

interface Installation {
  id: string;
  nomPoste: string;
  nomUtilisateur: string;
  organisation: string;
  numeroFacture: string;
  dateFacture: string;
  licenses: License[];
}

export default function InstallationLicenseList() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const response = await fetch('/api/licenses');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des installations');
        }
        const data = await response.json();
        setInstallations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchInstallations();
  }, []);

  if (loading) {
    return <div className="p-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4 mb-4">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ))}
    </div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Liste des Installations de Licences</h1>
        {installations.map((installation) => (
          <Card key={installation.id} className="p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2">Installation: {installation.nomPoste}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <p><strong>Utilisateur:</strong> {installation.nomUtilisateur}</p>
              <p><strong>Organisation:</strong> {installation.organisation}</p>
              <p><strong>Facture:</strong> {installation.numeroFacture}</p>
              <p><strong>Date de facture:</strong> {installation.dateFacture}</p>
            </div>
            <h3 className="text-lg font-semibold mb-2">Licences</h3>
            {installation.licenses.map((license, index) => (
              <div key={index} className="ml-4 mb-2">
                <p><strong>Type:</strong> {license.typeLicense}</p>
                <p><strong>Description:</strong> {license.description}</p>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
