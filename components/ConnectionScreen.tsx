'use client';

import React, { useState } from 'react';

interface ConnectionScreenProps {
  onConnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

export const ConnectionScreen: React.FC<ConnectionScreenProps> = ({
  onConnect,
  isConnecting,
  error
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">🕵️ Шпион</h1>
          <p className="text-gray-400">Brawl Stars Edition - Online</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border-l-4 border-red-600 p-4 rounded">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Подключение...' : 'Подключиться к серверу'}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="font-semibold text-gray-300 mb-2">О игре:</h3>
          <p className="text-sm text-gray-400">
            Онлайн версия игры «Шпион». Угадайте шпионов среди игроков!
            Шпионы не знают загаданного персонажа, а мирные жители должны их вычислить.
          </p>
        </div>
      </div>
    </div>
  );
};
