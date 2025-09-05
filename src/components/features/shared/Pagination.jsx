import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
                        pagination,
                        currentPage,
                        setCurrentPage,
                        itemsLength
                    }) => {
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(pagination.pages, prev + 1));

    return (
        <div className="px-4 sm:px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                    Page <span className="font-medium">{pagination.page}</span> sur <span className="font-medium">{pagination.pages}</span> —
                    <span className="block sm:inline"> Affichage de <span className="font-medium">{itemsLength}</span> sur <span className="font-medium">{pagination.total}</span> tâche(s)</span>
                </div>
                <div className="flex justify-center space-x-2">
                    <button
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        onClick={handlePrevPage}
                        disabled={pagination.page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                    </button>

                    <div className="hidden sm:flex space-x-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            let pageNum;
                            if (pagination.pages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= pagination.pages - 2) {
                                pageNum = pagination.pages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 border text-sm rounded-md transition-colors ${
                                        pagination.page === pageNum
                                            ? 'bg-zinc-600 text-white'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        onClick={handleNextPage}
                        disabled={pagination.page >= pagination.pages}
                    >
                        Suivant
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;