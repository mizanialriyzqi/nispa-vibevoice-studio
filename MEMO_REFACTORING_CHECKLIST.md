# ✅ Checklist: Stabilizzazione Context con `useMemo`

Questa checklist si focalizza sulla risoluzione del crash su Edge tramite la stabilizzazione dei riferimenti dei Context Provider.

> [!IMPORTANT]
> Senza `useMemo`, un oggetto `value={{ ... }}` viene ricreato ad ogni render del Provider. Con 3 contesti annidati e ~16 stati che cambiano all'avvio, l'albero dei componenti viene travolto da centinaia di aggiornamenti inutili.

---

## 1. GlobalContext.tsx (Root)
- [ ] Aprire `frontend/src/context/GlobalContext.tsx`.
- [ ] Importare `useMemo` da `'react'`.
- [ ] Avvolgere l'oggetto `value` in un hook `useMemo`.
- [ ] **Dependency Array:** includere ogni singolo stato e funzione specifica (es. `appMode`, `voices`, `models`, `refreshTtsData`).
- [ ] Verificare che il componente `App.tsx` non si ri-renderizzi più quando cambia solo uno stato interno (es. `voices`).

---

## 2. SubtitleContext.tsx (God Object)
- [ ] Aprire `frontend/src/features/subtitle/context/SubtitleContext.tsx`.
- [ ] Importare `useMemo`.
- [ ] Creare un `contextValue` usando `useMemo` che contenga tutte le 40+ proprietà (file, segmenti, logs, progresso, ecc.).
- [ ] **Nota:** Includere temporaneamente anche le funzioni non ancora memoizzate (Fase 5) nell'array di dipendenze.
- [ ] Passare `contextValue` al Provider.

---

## 3. TranslationContext.tsx
- [ ] Aprire `frontend/src/features/subtitle/context/TranslationContext.tsx`.
- [ ] Implementare `useMemo` per l'oggetto `value` del `TranslationProvider`.
- [ ] Includere stati come `isTranslating`, `translationProgress`, e i testi correnti/precedenti nelle dipendenze.

---

## 4. Verifica e Debug
- [ ] **Test Crash:** Aprire l'app su Edge e verificare se il crash è risolto.
- [ ] **Monitoraggio Render:**
    - Inserire `console.count('Render GlobalProvider')` nel corpo del Provider.
    - Dopo il fix, il conteggio deve essere drasticamente ridotto.
- [ ] **React DevTools:** Usare il tab "Profiler" per confermare che i figli non ri-renderizzano se le loro props/context non cambiano.

---

### Esempio pratico del pattern:
```typescript
const contextValue = useMemo(() => ({
  state1,
  state2,
  action1,
  // ...
}), [state1, state2, action1]);

return (
  <Context.Provider value={contextValue}>
    {children}
  </Context.Provider>
);
```
