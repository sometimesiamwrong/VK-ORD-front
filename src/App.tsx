import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from './api'
import type { ApiResponse, CreateContractRequest, CreateCreativeRequest, VkCreativeForm, AiKktyItem } from './types'
import { generateContractExternalId, getPartyDisplayName, getPartyShortWithOpf, isValidInn, loadFromLocalStorage, nowTimestampString, saveToLocalStorage } from './utils'
import { TagSelector } from './TagSelector'

type WizardState = {
    step: 1 | 2 | 3 | 4
    consent: boolean
    // step 1
    advertiserInn: string
    contractorInn: string
    advertiserName?: string | null
    contractorName?: string | null
    advertiserShortWithOpf?: string | null
    contractorShortWithOpf?: string | null
    advertiserInfo?: string | null
    contractorInfo?: string | null
    // step 2
    contractExternalId: string
    paySum?: number | null
    payDateEnd?: string | null
    // step 3
    creativeExternalId: string
    contractExternalIds: string[]
    kktyCodes: string[]
    format: VkCreativeForm
    contentUrls: string[]
    targetAudience?: string | null
    text?: string | null
    // result
    erid?: string | null
    // local history for suggestions
    partyHistory?: Array<{
        inn: string
        shortWithOpf?: string | null
        fullName?: string | null
        type?: string | null
        timestamp: number
    }>
}

const LOCAL_KEY = 'vkord-wizard-state'

const initialState: WizardState = {
    step: 1,
    consent: false,
    advertiserInn: '',
    contractorInn: '',
    advertiserName: null,
    contractorName: null,
    advertiserShortWithOpf: null,
    contractorShortWithOpf: null,
    advertiserInfo: null,
    contractorInfo: null,
    contractExternalId: generateContractExternalId(new Date(), 1),
    paySum: null,
    payDateEnd: null,
    creativeExternalId: nowTimestampString(),
    contractExternalIds: [],
    kktyCodes: [],
    format: 'banner',
    contentUrls: [],
    targetAudience: null,
    text: null,
    erid: null
    ,partyHistory: []
}

function parseList(input: string): string[] {
    return input
        .split(/[\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean)
}

export const App: React.FC = () => {
    const [state, setState] = useState<WizardState>(() => loadFromLocalStorage(LOCAL_KEY, initialState))
    const [loading, setLoading] = useState<{ [k: string]: boolean }>({})
    const [message, setMessage] = useState<string>('')
    const [kktyHints, setKktyHints] = useState<AiKktyItem[]>([])

    const canNextFromStep1 = useMemo(() => isValidInn(state.advertiserInn) && isValidInn(state.contractorInn) && state.consent, [state])
    const canNextFromStep2 = useMemo(() => !!state.contractExternalId && !!state.paySum && state.paySum! > 0, [state])
    const canSubmitCreative = useMemo(() => !!state.creativeExternalId && state.contractExternalIds.length >= 1 && state.kktyCodes.length >= 1, [state])

    useEffect(() => {
        const id = setInterval(() => saveToLocalStorage(LOCAL_KEY, state), 2000)
        return () => clearInterval(id)
    }, [state])

    useEffect(() => {
        const onBlur = () => saveToLocalStorage(LOCAL_KEY, state)
        window.addEventListener('blur', onBlur, true)
        return () => window.removeEventListener('blur', onBlur, true)
    }, [state])

    function setLoad(key: string, v: boolean) {
        setLoading(x => ({ ...x, [key]: v }))
    }

    function showMsg(apiResp?: ApiResponse<unknown> | null, fallback?: string) {
        if (apiResp) setMessage(apiResp.message || '')
        else if (fallback) setMessage(fallback)
        else setMessage('')
    }

    async function lookupInn(kind: 'advertiser' | 'contractor') {
        const inn = kind === 'advertiser' ? state.advertiserInn : state.contractorInn
        if (!isValidInn(inn)) {
            setMessage('ИНН должен содержать 10 или 12 цифр')
            return
        }
        setLoad(`lookup-${kind}`, true)
        try {
            const resp = await api.partyLookup(inn)
            showMsg(resp)
            const display = resp?.data ? getPartyDisplayName(resp.data.name) : ''
            const shortWithOpf = resp?.data ? getPartyShortWithOpf(resp.data.name) : ''
            const t = resp?.data?.type || ''
            const info = display ? `${display}${t ? ` (${t})` : ''}` : null
            setState(prev => ({
                ...prev,
                [`${kind}Info`]: info,
                [`${kind}Name`]: display || null,
                [`${kind}ShortWithOpf`]: shortWithOpf || null
            } as WizardState))
            // upsert history
            setState(prev => {
                const list = prev.partyHistory || []
                const innKey = inn
                const idx = list.findIndex(i => i.inn === innKey)
                const item = {
                    inn: innKey,
                    shortWithOpf: shortWithOpf || display || null,
                    fullName: display || null,
                    type: (t as string) || null,
                    timestamp: Date.now()
                }
                const next = idx >= 0 ? [...list.slice(0, idx), item, ...list.slice(idx + 1)] : [item, ...list]
                // keep up to 10
                return { ...prev, partyHistory: next.slice(0, 10) }
            })
        } catch (e: any) {
            setMessage(`Ошибка поиска: ${e?.message || e}`)
        } finally {
            setLoad(`lookup-${kind}`, false)
        }
    }

    async function createCounterparty(kind: 'advertiser' | 'contractor') {
        const inn = kind === 'advertiser' ? state.advertiserInn : state.contractorInn
        if (!isValidInn(inn)) {
            setMessage('ИНН должен содержать 10 или 12 цифр')
            return
        }
        setLoad(`create-${kind}`, true)
        try {
            const resp = await api.setCounterparty(inn)
            showMsg(resp)
        } catch (e: any) {
            setMessage(`Ошибка создания контрагента: ${e?.message || e}`)
        } finally {
            setLoad(`create-${kind}`, false)
        }
    }

    async function saveContract() {
        // ensure contractExternalId is present
        if (!state.contractExternalId || !state.contractExternalId.trim()) {
            const gen = generateContractExternalId(new Date(), 1)
            setState(prev => ({ ...prev, contractExternalId: gen }))
        }
        const payload: CreateContractRequest = {
            externalId: (state.contractExternalId && state.contractExternalId.trim()) || generateContractExternalId(new Date(), 1),
            clientExternalId: state.advertiserInn,
            contractorExternalId: state.contractorInn,
            paySum: state.paySum || 0,
            payDateEnd: state.payDateEnd || undefined
        }
        setLoad('contract', true)
        try {
            const resp = await api.createContract(payload)
            showMsg(resp)
            if (resp.success && resp.data?.externalId) {
                setState(prev => ({ ...prev, contractExternalId: resp.data!.externalId, contractExternalIds: [resp.data!.externalId] }))
            }
        } catch (e: any) {
            setMessage(`Ошибка создания договора: ${e?.message || e}`)
        } finally {
            setLoad('contract', false)
        }
    }

    async function createCreative() {
        const payload: CreateCreativeRequest = {
            externalId: state.creativeExternalId,
            contractExternalIds: state.contractExternalIds.length ? state.contractExternalIds : [state.contractExternalId],
            kktyCodes: state.kktyCodes,
            format: state.format,
            contentUrls: state.contentUrls.length ? state.contentUrls : undefined,
            targetAudience: state.targetAudience || undefined,
            text: state.text || undefined
        }
        setLoad('creative', true)
        try {
            const resp = await api.createCreative(payload)
            showMsg(resp)
            let erid = resp?.data?.erid || null
            if (!erid) {
                const getResp = await api.getCreative(state.creativeExternalId)
                showMsg(getResp)
                erid = getResp?.data?.erid || null
            }
            if (erid) setState(prev => ({ ...prev, erid, step: 4 }))
        } catch (e: any) {
            setMessage(`Ошибка создания креатива: ${e?.message || e}`)
        } finally {
            setLoad('creative', false)
        }
    }

	async function guessKktyByText() {
		const text = state.text?.trim() || ''
		if (!text) {
			setMessage('Введите текст для подбора ККТУ')
			return
		}
		setLoad('ai-kkty', true)
		try {
			const resp = await api.getKktyByText(text)
			showMsg(resp)
			const list = resp?.data?.kkty || []
			setKktyHints(list)
			if (list.length) {
				const codes = list.map((i: AiKktyItem) => i.code).filter(Boolean)
				setState(prev => ({ ...prev, kktyCodes: Array.from(new Set([...(prev.kktyCodes || []), ...codes])) }))
			}
		} catch (e: any) {
			setMessage(`Ошибка подбора ККТУ: ${e?.message || e}`)
		} finally {
			setLoad('ai-kkty', false)
		}
	}

    function exportJson() {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vkord-state-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const fileRef = useRef<HTMLInputElement | null>(null)
    function importJsonClick() {
        fileRef.current?.click()
    }
    function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result)) as WizardState
                setState(parsed)
                showMsg(undefined, 'Импорт выполнен')
            } catch {
                setMessage('Не удалось импортировать JSON')
            }
        }
        reader.readAsText(file)
        e.currentTarget.value = ''
    }

    const advertiserShortWithOpf = state.advertiserShortWithOpf || state.advertiserName || ''
    const copyText = `Реклама. ${advertiserShortWithOpf}, ${state.advertiserInn || ''}, ${state.erid || ''}`

    function applyInnFromHistory(kind: 'advertiser' | 'contractor', inn: string) {
        const hit = (state.partyHistory || []).find(h => h.inn === inn)
        if (!hit) return
        setState(prev => ({
            ...prev,
            [`${kind}Inn`]: inn,
            [`${kind}ShortWithOpf`]: hit.shortWithOpf || null,
            [`${kind}Name`]: hit.fullName || null,
            [`${kind}Info`]: `${hit.fullName || hit.shortWithOpf || ''}${hit.type ? ` (${hit.type})` : ''}` || null
        } as WizardState))
    }

    function recordInnToHistory(inn: string, name?: string | null, type?: string | null) {
        if (!isValidInn(inn)) return
        setState(prev => {
            const list = prev.partyHistory || []
            const idx = list.findIndex(i => i.inn === inn)
            const item = {
                inn,
                shortWithOpf: name || null,
                fullName: name || null,
                type: type || null,
                timestamp: Date.now()
            }
            const next = idx >= 0 ? [...list.slice(0, idx), item, ...list.slice(idx + 1)] : [item, ...list]
            return { ...prev, partyHistory: next.slice(0, 10) }
        })
    }

	function clearStep(stepNumber: 1 | 2 | 3 | 4) {
		setState(prev => {
			switch (stepNumber) {
				case 1:
					return {
						...prev,
						advertiserInn: '',
						contractorInn: '',
						advertiserName: null,
						contractorName: null,
						advertiserShortWithOpf: null,
						contractorShortWithOpf: null,
						advertiserInfo: null,
						contractorInfo: null,
						consent: false
					}
				case 2:
					return {
						...prev,
						contractExternalId: '',
						paySum: null,
						payDateEnd: null
					}
				case 3:
					const cleared: WizardState = {
						...prev,
						creativeExternalId: '',
						contractExternalIds: [],
						kktyCodes: [],
						format: 'banner' as VkCreativeForm,
						contentUrls: [],
						targetAudience: null,
						text: null
					}
					return cleared
				case 4:
					return { ...prev, erid: null }
				default:
					return prev
			}
		})
		if (stepNumber === 3) setKktyHints([])
		setMessage('')
	}

    return (
        <div className="vk-container" style={{ textAlign: 'left' }}>
            <h1>Маркировка рекламы (VK ОРД)</h1>
            <p>Шаги: Контрагенты → Договор → Креатив → ERID</p>

            <div style={{ display: 'flex', gap: 12, marginTop: 12, marginBottom: 20 }}>
                <button className="vk-btn vk-btn--secondary" onClick={exportJson}>Экспорт JSON</button>
                <button className="vk-btn vk-btn--secondary" onClick={importJsonClick}>Импорт JSON</button>
                <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={onImportFile} />
            </div>

            {message && (
                <div className="vk-alert" style={{ marginBottom: 12 }}>
                    {message}
                </div>
            )}

            {/* Step 1 */}
            <details open={state.step === 1} style={{ marginBottom: 16 }}>
                <summary>1) Контрагенты</summary>
                <div className="vk-card" style={{ marginTop: 10 }}>
                    <div className="vk-label">ИНН рекламодателя</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            className="vk-input"
                            value={state.advertiserInn}
                            list="innHistory"
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '')
                                setState({ ...state, advertiserInn: val })
                                if ((state.partyHistory || []).some(h => h.inn === val)) applyInnFromHistory('advertiser', val)
                            }}
                            onBlur={() => recordInnToHistory(state.advertiserInn, state.advertiserShortWithOpf || state.advertiserName || null, (state.advertiserInfo || '').includes('(') ? (state.advertiserInfo || '').split('(').at(-1)?.replace(')', '') || null : null)}
                            autoComplete="on"
                            placeholder="10 или 12 цифр"
                        />
                        <button className="vk-btn vk-btn--primary" disabled={!isValidInn(state.advertiserInn) || loading['lookup-advertiser']} onClick={() => lookupInn('advertiser')}>
                            {loading['lookup-advertiser'] ? 'Поиск…' : 'Проверить'}
                        </button>
                        <button className="vk-btn" disabled={!isValidInn(state.advertiserInn) || loading['create-advertiser']} onClick={() => createCounterparty('advertiser')}>
                            {loading['create-advertiser'] ? 'Создание…' : 'Создать в VK ОРД'}
                        </button>
                    </div>
                    {state.advertiserInfo && <div style={{ color: 'var(--vk-muted)', marginTop: 4 }}>{state.advertiserInfo}</div>}

                    <div style={{ height: 14 }} />

                    <div className="vk-label">ИНН исполнителя</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            className="vk-input"
                            value={state.contractorInn}
                            list="innHistory"
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '')
                                setState({ ...state, contractorInn: val })
                                if ((state.partyHistory || []).some(h => h.inn === val)) applyInnFromHistory('contractor', val)
                            }}
                            onBlur={() => recordInnToHistory(state.contractorInn, state.contractorShortWithOpf || state.contractorName || null, (state.contractorInfo || '').includes('(') ? (state.contractorInfo || '').split('(').at(-1)?.replace(')', '') || null : null)}
                            autoComplete="on"
                            placeholder="10 или 12 цифр"
                        />
                        <button className="vk-btn vk-btn--primary" disabled={!isValidInn(state.contractorInn) || loading['lookup-contractor']} onClick={() => lookupInn('contractor')}>
                            {loading['lookup-contractor'] ? 'Поиск…' : 'Проверить'}
                        </button>
                        <button className="vk-btn" disabled={!isValidInn(state.contractorInn) || loading['create-contractor']} onClick={() => createCounterparty('contractor')}>
                            {loading['create-contractor'] ? 'Создание…' : 'Создать в VK ОРД'}
                        </button>
                    </div>
                    {state.contractorInfo && <div style={{ color: 'var(--vk-muted)', marginTop: 4 }}>{state.contractorInfo}</div>}

                    <div style={{ marginTop: 14 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" checked={state.consent} onChange={e => setState({ ...state, consent: e.target.checked })} />
                            Согласен на обработку данных
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button className="vk-btn" onClick={() => clearStep(1)}>Очистить поля</button>
                        <button className="vk-btn" onClick={() => saveToLocalStorage(LOCAL_KEY, state)}>Сохранить шаг</button>
                        <button className="vk-btn vk-btn--primary" disabled={!canNextFromStep1} onClick={() => setState({ ...state, step: 2 })}>Далее</button>
                    </div>
                </div>
            </details>

            {/* Shared datalist for INN suggestions */}
            <datalist id="innHistory">
                {(state.partyHistory || []).map(h => (
                    <option key={h.inn} value={h.inn} label={`${h.shortWithOpf || h.fullName || ''}${h.type ? ` (${h.type})` : ''}`} />
                ))}
            </datalist>

            {/* Step 2 */}
            <details open={state.step === 2} style={{ marginBottom: 16 }}>
                <summary>2) Договор</summary>
                <div className="vk-card" style={{ marginTop: 10 }}>
                    <div style={{ display: 'grid', gap: 8 }}>
						<label>
							Идентификатор договора
                            <input
                                className="vk-input"
                                value={state.contractExternalId}
                                onChange={e => setState({ ...state, contractExternalId: e.target.value })}
                                onBlur={() => {
                                    if (!state.contractExternalId || !state.contractExternalId.trim()) {
                                        setState(prev => ({ ...prev, contractExternalId: generateContractExternalId(new Date(), 1) }))
                                    }
                                }}
                            />
						</label>
                        <label>
                            ИНН заказчика (clientExternalId)
                            <input className="vk-input" value={state.advertiserInn} readOnly />
                        </label>
                        <label>
                            ИНН исполнителя (contractorExternalId)
                            <input className="vk-input" value={state.contractorInn} readOnly />
                        </label>
                        <label>
                            Сумма оплаты (paySum)
                            <input className="vk-input" type="number" min={1} value={state.paySum || ''} onChange={e => setState({ ...state, paySum: Number(e.target.value) || null })} />
                        </label>
                        <label>
                            Дата окончания оплаты (payDateEnd)
                            <input className="vk-input" type="date" value={state.payDateEnd || ''} onChange={e => setState({ ...state, payDateEnd: e.target.value || null })} />
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button className="vk-btn" onClick={() => clearStep(2)}>Очистить поля</button>
                        <button className="vk-btn" onClick={() => setState({ ...state, step: 1 })}>Назад</button>
                        <button className="vk-btn vk-btn--primary" disabled={loading['contract']} onClick={saveContract}>{loading['contract'] ? 'Сохранение…' : 'Сохранить'}</button>
                        <button className="vk-btn vk-btn--primary" disabled={!canNextFromStep2} onClick={() => setState(prev => ({ ...prev, contractExternalIds: [prev.contractExternalId], step: 3 }))}>Далее</button>
                    </div>
                </div>
            </details>

            {/* Step 3 */}
            <details open={state.step === 3} style={{ marginBottom: 16 }}>
                <summary>3) Креатив</summary>
                <div className="vk-card" style={{ marginTop: 10 }}>
                    <div style={{ display: 'grid', gap: 8 }}>
						<label>
							Идентификатор креатива
                            <input className="vk-input" value={state.creativeExternalId} onChange={e => setState({ ...state, creativeExternalId: e.target.value })} />
						</label>
						<label>
							Идентификаторы договоров (через запятую, если несколько)
                            <input className="vk-input"
								value={state.contractExternalIds.join(',')}
								onChange={e => setState({ ...state, contractExternalIds: parseList(e.target.value) })}
								placeholder={state.contractExternalId}
							/>
						</label>
                        {/* Move KKTY below text, so we remove it here and re-add later */}
                        <label>
                            Формат
                            <select className="vk-select" value={state.format} onChange={e => setState({ ...state, format: e.target.value as VkCreativeForm })}>
                                {[
                                    'banner',
                                    'text_block',
                                    'text_graphic_block',
                                    'audio',
                                    'video',
                                    'live_audio',
                                    'live_video',
                                    'text_video_block',
                                    'text_graphic_video_block',
                                    'text_audio_block',
                                    'text_graphic_audio_block',
                                    'text_audio_video_block',
                                    'text_graphic_audio_video_block',
                                    'banner_html5'
                                ].map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Ссылки на контент (через запятую, если несколько)
                            <input className="vk-input" value={state.contentUrls.join(',')} onChange={e => setState({ ...state, contentUrls: parseList(e.target.value) })} placeholder="https://..." />
                        </label>
                        <label>
                            Целевая аудитория
                            <input className="vk-input" value={state.targetAudience || ''} onChange={e => setState({ ...state, targetAudience: e.target.value })} />
                        </label>
                        <label>
                            Текст
                            <textarea
                                className="vk-textarea"
                                value={state.text || ''}
                                onChange={e => setState({ ...state, text: e.target.value })}
                                rows={4}
                                placeholder="Опишите ваш креатив или текст рекламы..."
                            />
                        </label>
                        {/* AI KKTY Suggestions */}
                        {kktyHints.length > 0 && (
                            <div className="vk-card" style={{ marginTop: 6 }}>
                                <div style={{ display: 'grid', gap: 6 }}>
                                    {kktyHints.map((h, idx) => (
                                        <div key={idx}>
                                            <div style={{ fontWeight: 700 }}>{h.fullName}</div>
                                            <div style={{ color: 'var(--vk-muted)' }}>{h.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
               <button className="vk-btn vk-btn-magic" style={{ marginTop: 8, marginBottom: 8 }} disabled={!state.text?.trim() || loading['ai-kkty']} onClick={guessKktyByText}>
                 {loading['ai-kkty'] ? '✨ Подбор…' : '✨ Узнать ККТУ по тексту'}
               </button>
               <button className="vk-btn" style={{ marginTop: 8, marginBottom: 8 }} onClick={async () => {
                 console.log('Testing auth...')
                 const result = await api.authenticate('admin', 'password')
                 console.log('Auth result:', result)
                 alert(result.success ? 'Аутентификация успешна!' : `Ошибка: ${result.error}`)
               }}>
                 🔐 Тест аутентификации
               </button>
                        </div>
                        <TagSelector
                            selectedCodes={state.kktyCodes}
                            onChange={codes => setState({ ...state, kktyCodes: codes })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button className="vk-btn" onClick={() => clearStep(3)}>Очистить поля</button>
                        <button className="vk-btn" onClick={() => setState({ ...state, step: 2 })}>Назад</button>
                        <button className="vk-btn vk-btn--primary" disabled={!canSubmitCreative || loading['creative']} onClick={createCreative}>{loading['creative'] ? 'Отправка…' : 'Получить ERID'}</button>
                    </div>
                </div>
            </details>

            {/* Final */}
            {state.step === 4 && (
                <>
                    <div className="vk-card" style={{ padding: 22 }}>
                        <h2>ERID</h2>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{state.erid || 'ожидание…'}</div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                            <button className="vk-btn" onClick={() => navigator.clipboard.writeText(state.erid || '')}>Скопировать ERID</button>
                            <button className="vk-btn" onClick={() => {
                                const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(state.erid || '')}`
                                window.open(url, '_blank')
                            }}>QR‑код</button>
                            <button className="vk-btn" onClick={() => window.print()}>Печать</button>
                            <button className="vk-btn vk-btn--secondary" onClick={exportJson}>Экспорт JSON</button>
                        </div>
                    </div>
                    <div className="vk-card" style={{ marginTop: 14, padding: 22 }}>
                        <h3>Текст для копирования</h3>
                        <pre className="vk-pre">{copyText}</pre>
                        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                            <button className="vk-btn vk-btn--primary" onClick={() => navigator.clipboard.writeText(copyText)}>Скопировать текст</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}


