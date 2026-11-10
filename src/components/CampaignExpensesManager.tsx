"use client";

import React, { useState } from "react";
import { createExpense, updateExpense, deleteExpense, createExpenseCategory, deleteExpenseCategory } from "@/app/actions/expenses";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  _count?: { expenses: number };
}

interface Expense {
  id: string;
  campaignId: string;
  categoryId: string;
  title: string;
  description?: string | null;
  amount: number;
  date: Date | string;
  beneficiary?: string | null;
  receiptUrl?: string | null;
  paymentMode: string;
  recordedBy?: { id: string; name?: string | null; email: string } | null;
  category: { id: string; name: string; color?: string | null };
}

interface CampaignExpensesManagerProps {
  campaignId: string;
  campaignName: string;
  finances: {
    totalPaidAmount: number;
    totalExpenses: number;
    netBalance: number;
  };
  expenses: Expense[];
  categories: Category[];
}

export default function CampaignExpensesManager({
  campaignId,
  campaignName,
  finances,
  expenses = [],
  categories = [],
}: CampaignExpensesManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Category Form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatColor, setNewCatColor] = useState("#2563EB");
  const [catError, setCatError] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState<string | null>(null);

  // Quick stats
  const totalPaid = finances?.totalPaidAmount || 0;
  const totalExpenses = finances?.totalExpenses || 0;
  const netBalance = finances?.netBalance !== undefined ? finances.netBalance : (totalPaid - totalExpenses);
  const expenseRatio = totalPaid > 0 ? Math.min(100, Math.round((totalExpenses / totalPaid) * 100)) : 0;

  // Filtered expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.beneficiary && exp.beneficiary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === "ALL" || exp.categoryId === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setErrorMessage(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setErrorMessage(null);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.")) {
      return;
    }
    setIsSubmitting(true);
    const res = await deleteExpense(id, campaignId);
    setIsSubmitting(false);
    if (!res.success) {
      alert(res.error || "Erreur lors de la suppression.");
    }
  };

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append("campaignId", campaignId);

    let res;
    if (editingExpense) {
      formData.append("id", editingExpense.id);
      res = await updateExpense(formData);
    } else {
      res = await createExpense(formData);
    }

    setIsSubmitting(false);

    if (res.success) {
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    } else {
      setErrorMessage(res.error || "Une erreur est survenue.");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    setCatSuccess(null);

    if (!newCatName.trim()) {
      setCatError("Le nom de la catégorie est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    const res = await createExpenseCategory(newCatName, newCatDesc, newCatColor);
    setIsSubmitting(false);

    if (res.success) {
      setCatSuccess("Catégorie créée avec succès !");
      setNewCatName("");
      setNewCatDesc("");
      setTimeout(() => setCatSuccess(null), 3000);
    } else {
      setCatError(res.error || "Erreur lors de la création.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette catégorie ?")) return;
    setIsSubmitting(true);
    const res = await deleteExpenseCategory(id);
    setIsSubmitting(false);
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Synthèse financière de la campagne (KPIs Trésorerie) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cotisations Encaissées</span>
            <div className="mt-2 text-3xl font-bold text-emerald-600">
              {totalPaid.toLocaleString("fr-FR")} <span className="text-sm font-medium text-gray-500">CFA</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Total des cotisations membres validées</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Dépenses Réglées</span>
              <span className="text-xs font-medium bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full">
                {expenseRatio}% des cotisations
              </span>
            </div>
            <div className="mt-2 text-3xl font-bold text-rose-600">
              {totalExpenses.toLocaleString("fr-FR")} <span className="text-sm font-medium text-gray-500">CFA</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">{expenses.length} dépense(s) imputée(s) à la campagne</p>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${
          netBalance >= 0 ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"
        }`}>
          <div>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Solde Net de la Campagne</span>
            <div className={`mt-2 text-3xl font-extrabold ${netBalance >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {netBalance.toLocaleString("fr-FR")} <span className="text-sm font-medium">CFA</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            {netBalance >= 0 
              ? "✨ Trésorerie disponible après déduction de toutes les dépenses." 
              : "⚠️ Déficit : Les dépenses dépassent les cotisations collectées !"}
          </p>
        </div>
      </div>

      {/* 2. Barre d'action et recherche */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Dépenses de la campagne</h2>
            <p className="text-sm text-gray-500">
              Enregistrez et suivez les sorties d'argent déduites de la cagnotte de cette campagne.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              🏷️ Gérer les catégories
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover shadow-sm transition-colors"
            >
              ➕ Nouvelle dépense
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher par titre, bénéficiaire ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="sm:w-64">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="ALL">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau des dépenses */}
        <div className="overflow-x-auto pt-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-600">Aucune dépense enregistrée</p>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur « Nouvelle dépense » pour ajouter une sortie d'argent.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Libellé / Titre</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Catégorie</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Bénéficiaire</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Mode</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Montant</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Justificatif</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {new Date(exp.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{exp.title}</div>
                      {exp.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{exp.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white shadow-xs"
                        style={{ backgroundColor: exp.category?.color || "#2563EB" }}
                      >
                        {exp.category?.name || "Général"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {exp.beneficiary || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">
                        {exp.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-rose-600">
                      {exp.amount.toLocaleString("fr-FR")} CFA
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {exp.receiptUrl ? (
                        <button
                          onClick={() => setPreviewReceiptUrl(exp.receiptUrl!)}
                          className="text-xs text-primary hover:text-primary-hover font-medium underline inline-flex items-center gap-1"
                        >
                          📎 Voir reçu
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">Aucun</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded-md"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. Modal : Enregistrer / Modifier une Dépense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingExpense ? "Modifier la dépense" : "Enregistrer une dépense"}
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Titre / Libellé de la dépense *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingExpense?.title || ""}
                  required
                  placeholder="Ex: Achat fournitures bureau, Sonorisation..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Montant (CFA) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="any"
                    min="1"
                    defaultValue={editingExpense?.amount || ""}
                    required
                    placeholder="Ex: 50000"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Date de réalisation
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={
                      editingExpense?.date
                        ? new Date(editingExpense.date).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase">
                    Catégorie de dépense *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpenseModalOpen(false);
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    + Nouvelle catégorie
                  </button>
                </div>
                <select
                  name="categoryId"
                  defaultValue={editingExpense?.categoryId || (categories[0]?.id || "")}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Bénéficiaire / Prestataire
                  </label>
                  <input
                    type="text"
                    name="beneficiary"
                    defaultValue={editingExpense?.beneficiary || ""}
                    placeholder="Ex: Société X, Traiteur Mamadou..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Mode de règlement
                  </label>
                  <select
                    name="paymentMode"
                    defaultValue={editingExpense?.paymentMode || "CASH"}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="CASH">Espèces (Cash)</option>
                    <option value="WAVE">Wave</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="STRIPE">Virement / Carte</option>
                    <option value="OTHER">Autre / Chèque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description / Justification (optionnel)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingExpense?.description || ""}
                  placeholder="Détails supplémentaires sur la dépense..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Justificatif / Facture (Reçu PDF ou image, optionnel)
                </label>
                <input
                  type="file"
                  name="receipt"
                  accept="image/*,application/pdf"
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {editingExpense?.receiptUrl && (
                  <p className="mt-1 text-xs text-gray-500">
                    Fichier actuel :{" "}
                    <a
                      href={editingExpense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Consulter le justificatif existant
                    </a>
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : editingExpense ? "Mettre à jour" : "Enregistrer la dépense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal : Gestion des catégories personnalisables */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">🏷️ Gestion des catégories de dépenses</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Formulaire d'ajout */}
              <form onSubmit={handleCreateCategory} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase">Ajouter une nouvelle catégorie</h4>

                {catError && (
                  <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                    {catError}
                  </div>
                )}
                {catSuccess && (
                  <div className="p-2 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                    {catSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom de la catégorie *</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Frais juridiques, Assurances..."
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description (optionnelle)</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Détails d'utilisation..."
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="h-8 w-12 rounded cursor-pointer border border-gray-300 p-0"
                    />
                  </div>
                  <div className="flex-1 flex justify-end items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50"
                    >
                      Ajouter la catégorie
                    </button>
                  </div>
                </div>
              </form>

              {/* Liste des catégories existantes */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase mb-2">
                  Catégories existantes ({categories.length})
                </h4>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color || "#2563EB" }}
                        />
                        <span className="font-semibold text-gray-800">{cat.name}</span>
                        {cat._count?.expenses !== undefined && (
                          <span className="text-gray-400">({cat._count.expenses} dép.)</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-0.5 rounded hover:bg-red-50"
                        title="Supprimer cette catégorie"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Aperçu de Reçu / Facture */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Justificatif de dépense</h3>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-4 flex justify-center bg-gray-100 flex-grow min-h-[300px]">
              {previewReceiptUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewReceiptUrl}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title="Justificatif de dépense (PDF)"
                />
              ) : (
                <img
                  src={previewReceiptUrl}
                  alt="Justificatif de dépense"
                  className="max-w-full h-auto object-contain rounded shadow-sm border border-gray-200 bg-white"
                />
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
