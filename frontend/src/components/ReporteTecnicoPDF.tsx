import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// --- Interfaces ---
export interface CatalogoItem {
    id: number;
    descripcion: string;
    seccion_id: number;
}

export interface SeccionCatalogo {
    id: number;
    nombre: string;
    items: CatalogoItem[];
}

export interface RespuestaInspeccion {
    item_id: number;
    estado: "Conformable" | "Non-compliant" | "Unverified" | "N/A";
    comentarios?: string;
    evidencias?: string[]; // URLs or Base64
    evidenciasLocal?: { url: string }[]; // For local preview
}

export interface AccionPlan {
    id: string;
    descripcion: string;
    tipo: "Action Plan" | "Recommendation";
    responsable: string;
    fecha: string;
    criticidad: "High" | "Medium" | "Low";
    wo_numero?: string;
}

export interface ReporteDatos {
    planta: string;
    fecha_inicio: string;
    fecha_fin: string;
    responsable_cliente: string;
    maquina_serie: string;
    horas_maquina: string | number;
    proposito_visita: string;
    tipo_llenado: string;
    tipo_envase: string;
}

export interface ReporteCierre {
    comentarios_finales: string;
    eficiencias: string;
    perdidas: string;
    customer_review: string;
}

interface ReporteTecnicoPDFProps {
    datos: ReporteDatos;
    catalogo: SeccionCatalogo[];
    respuestas: Record<number, RespuestaInspeccion>;
    acciones: AccionPlan[];
    cierre: ReporteCierre;
    firmaSIG?: string;
    firmaCliente?: string;
    clienteNombre?: string;
}

// --- Styles Optimizados para Espacio ---
const styles = StyleSheet.create({
    page: {
        padding: 20, // Reduced from 30
        paddingTop: 50, // More top padding for fixed header
        paddingBottom: 40,
        fontSize: 9, // Reduced base font from 10 to 9
        fontFamily: 'Helvetica'
    },

    // Fixed Header
    header: {
        position: 'absolute',
        top: 15,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: '1.5px solid #2563eb',
        paddingBottom: 5
    },
    logo: { width: 60, height: 30, objectFit: 'contain' }, // Smaller logo
    headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    headerSub: { fontSize: 8, color: '#64748b' },

    // KPI Cards - More compact
    kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 5 },
    kpiCard: { flex: 1, padding: 5, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '0.5px solid #e2e8f0' },
    kpiValue: { fontSize: 14, fontWeight: 'bold', marginBottom: 1 },
    kpiLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase' },

    // General Info - Compact
    sectionTitle: { fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 4, color: '#2563eb', borderBottom: '0.5px solid #e2e8f0', paddingBottom: 2 },
    sectionTitleFirst: { fontSize: 10, fontWeight: 'bold', marginBottom: 4, color: '#2563eb', borderBottom: '0.5px solid #e2e8f0', paddingBottom: 2 },

    row: { flexDirection: 'row', marginBottom: 4 },
    col: { flex: 1 },
    label: { fontSize: 7, color: '#64748b', marginBottom: 1 },
    value: { fontSize: 9, color: '#1e293b' },

    // Tables - Compact
    table: { width: 'auto', marginBottom: 10 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomColor: '#cbd5e1', borderBottomWidth: 0.5, padding: 4, alignItems: 'center' },
    tableRow: { flexDirection: 'row', borderBottomColor: '#e2e8f0', borderBottomWidth: 0.5, padding: 4, alignItems: 'center' }, // Reduced padding
    colDesc: { width: '50%' },
    colStatus: { width: '18%', alignItems: 'center' },
    colObs: { width: '32%' },

    // Badges
    badge: { paddingVertical: 1, paddingHorizontal: 4, borderRadius: 2, fontSize: 7, fontWeight: 'bold', color: 'white' }, // Smaller badge
    badgeSuccess: { backgroundColor: '#10b981' },
    badgeError: { backgroundColor: '#ef4444' },
    badgeWarning: { backgroundColor: '#f59e0b' },
    badgeNeutral: { backgroundColor: '#64748b' },

    // Evidence - Smaller images
    evidenceContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 3 },
    evidenceImage: { width: 45, height: 45, objectFit: 'cover', borderRadius: 2, border: '0.5px solid #e2e8f0' }, // Smaller images

    // Signatures
    signatureRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }, // Reduced margin
    signatureBox: { width: '45%', alignItems: 'center' },
    signatureImage: { width: 100, height: 50, objectFit: 'contain', marginBottom: 3 },
    signatureLine: { width: '100%', borderBottom: '0.5px solid #cbd5e1', marginBottom: 3 },
    signatureName: { fontWeight: 'bold', fontSize: 9 },
    signatureRole: { fontSize: 7, color: '#64748b' },

    // Action Plan
    actionCard: { marginBottom: 4, padding: 4, backgroundColor: '#f8fafc', borderRadius: 2, border: '0.5px solid #e2e8f0' },
    actionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    actionBadge: { fontSize: 6, padding: 1, borderRadius: 2, color: 'white' },

    // Footer
    footer: { position: 'absolute', bottom: 15, left: 20, right: 20, textAlign: 'center', fontSize: 7, color: '#94a3b8', borderTop: '0.5px solid #e2e8f0', paddingTop: 4 },
});

export const ReporteTecnicoPDF: React.FC<ReporteTecnicoPDFProps> = ({ datos, catalogo, respuestas, acciones, cierre, firmaSIG, firmaCliente, clienteNombre }) => {

    // Calculate KPIs
    const allItems = catalogo.flatMap(s => s.items);
    const total = allItems.length;
    let conformable = 0, nonCompliant = 0, unverified = 0, na = 0;

    allItems.forEach(item => {
        const status = respuestas[item.id]?.estado || 'Unverified';
        if (status === 'Conformable') conformable++;
        else if (status === 'Non-compliant') nonCompliant++;
        else if (status === 'N/A') na++;
        else unverified++;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Conformable': return { text: 'OK', style: styles.badgeSuccess }; // Shortened text
            case 'Non-compliant': return { text: 'NOK', style: styles.badgeError };
            case 'N/A': return { text: 'N/A', style: styles.badgeNeutral };
            default: return { text: '?', style: styles.badgeWarning }; // Unverified
        }
    };

    const getCriticidadColor = (c: string) => {
        if (c === 'High') return '#ef4444';
        if (c === 'Medium') return '#f59e0b';
        return '#10b981';
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* FIXED HEADER */}
                <View style={styles.header} fixed>
                    <View>
                        <Image src="/SIG_logo.png" style={styles.logo} />
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.headerTitle}>REPORTE TÉCNICO</Text>
                        <Text style={styles.headerSub}>Technical Service Report | {datos.maquina_serie}</Text>
                    </View>
                </View>

                {/* PAGE 1 CONTENT: KPIs & Info */}
                <View style={styles.kpiContainer}>
                    <View style={styles.kpiCard}><Text style={[styles.kpiValue, { color: '#10b981' }]}>{conformable}</Text><Text style={styles.kpiLabel}>Conformable</Text></View>
                    <View style={styles.kpiCard}><Text style={[styles.kpiValue, { color: '#ef4444' }]}>{nonCompliant}</Text><Text style={styles.kpiLabel}>Non-Compliant</Text></View>
                    <View style={styles.kpiCard}><Text style={[styles.kpiValue, { color: '#f59e0b' }]}>{unverified}</Text><Text style={styles.kpiLabel}>Pending</Text></View>
                    <View style={styles.kpiCard}><Text style={[styles.kpiValue, { color: '#64748b' }]}>{na}</Text><Text style={styles.kpiLabel}>N/A</Text></View>
                    <View style={[styles.kpiCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}><Text style={[styles.kpiValue, { color: '#2563eb' }]}>{total}</Text><Text style={styles.kpiLabel}>Total</Text></View>
                </View>

                <View>
                    <Text style={styles.sectionTitleFirst}>INFORMACIÓN GENERAL</Text>
                    <View style={styles.row}>
                        <View style={styles.col}><Text style={styles.label}>Cliente:</Text><Text style={styles.value}>{clienteNombre || 'N/A'}</Text></View>
                        <View style={styles.col}><Text style={styles.label}>Planta:</Text><Text style={styles.value}>{datos.planta}</Text></View>
                        <View style={styles.col}><Text style={styles.label}>Responsable:</Text><Text style={styles.value}>{datos.responsable_cliente}</Text></View>
                        <View style={styles.col}><Text style={styles.label}>Fecha:</Text><Text style={styles.value}>{datos.fecha_inicio}</Text></View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.col}><Text style={styles.label}>Máquina:</Text><Text style={styles.value}>{datos.maquina_serie}</Text></View>
                        <View style={styles.col}><Text style={styles.label}>H. Máquina:</Text><Text style={styles.value}>{datos.horas_maquina}</Text></View>
                        <View style={styles.col}><Text style={styles.label}>Propósito:</Text><Text style={styles.value}>{datos.proposito_visita}</Text></View>
                    </View>
                </View>

                <View style={{ marginTop: 5 }}>
                    <Text style={styles.sectionTitle}>RESUMEN EJECUTIVO</Text>
                    <Text style={{ fontSize: 9, lineHeight: 1.3, color: '#334155', textAlign: 'justify' }}>
                        {cierre.comentarios_finales || 'Sin comentarios finales.'}
                    </Text>
                </View>

                <View style={{ marginBottom: 10 }}></View>

                {/* DYNAMIC SECTIONS - NOW CONTINUOUS */}
                {catalogo.map((seccion, index) => (
                    <View key={seccion.id} break={index > 0 && false}>
                        {/* We could use break if we wanted to enforce pages, but for compaction we rely on flow */}
                        <Text style={styles.sectionTitle}>{seccion.nombre.toUpperCase()}</Text>

                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>Punto de Inspección</Text>
                                <Text style={[styles.colStatus, { fontWeight: 'bold' }]}>Estado</Text>
                                <Text style={[styles.colObs, { fontWeight: 'bold' }]}>Obs./Evidencia</Text>
                            </View>

                            {seccion.items.map(item => {
                                const resp = respuestas[item.id];
                                const estado = resp?.estado || 'Unverified';
                                const badge = getStatusBadge(estado);
                                const imgs = [...(resp?.evidenciasLocal?.map(e => e.url) || []), ...(resp?.evidencias || [])];

                                return (
                                    <View key={item.id} style={styles.tableRow} wrap={false}>
                                        <View style={styles.colDesc}>
                                            <Text>{item.descripcion}</Text>
                                        </View>
                                        <View style={styles.colStatus}>
                                            <View style={[styles.badge, badge.style]}>
                                                <Text>{badge.text}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.colObs}>
                                            {resp?.comentarios ? <Text style={{ color: '#475569', marginBottom: 2 }}>{resp.comentarios}</Text> : null}
                                            {imgs.length > 0 && (
                                                <View style={styles.evidenceContainer}>
                                                    {imgs.map((img, idx) => (
                                                        <Image key={idx} src={img} style={styles.evidenceImage} />
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}

                {/* CLOSING & SIGNATURES */}
                <View break={false} style={{ marginTop: 10 }}>
                    <Text style={styles.sectionTitle}>PLAN DE ACCIÓN Y CIERRE</Text>

                    {acciones.length > 0 ? (
                        acciones.map((accion) => (
                            <View key={accion.id} style={styles.actionCard} wrap={false}>
                                <View style={styles.actionHeader}>
                                    <Text style={{ fontSize: 8, fontWeight: 'bold', width: '75%' }}>• {accion.descripcion}</Text>
                                    <View style={{ flexDirection: 'row', gap: 2 }}>
                                        <Text style={[styles.actionBadge, { backgroundColor: '#3b82f6' }]}>{accion.tipo === 'Action Plan' ? 'AP' : 'REC'}</Text>
                                        <Text style={[styles.actionBadge, { backgroundColor: getCriticidadColor(accion.criticidad) }]}>{accion.criticidad}</Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 7, color: '#64748b' }}>
                                    Resp: {accion.responsable} | Fecha: {accion.fecha} {accion.wo_numero ? `| WO: ${accion.wo_numero}` : ''}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#94a3b8' }}>No hay acciones registradas.</Text>
                    )}

                    <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { fontWeight: 'bold' }]}>Eficiencias:</Text>
                            <Text style={styles.value}>{cierre.eficiencias || '—'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { fontWeight: 'bold' }]}>Pérdidas/Riesgos:</Text>
                            <Text style={styles.value}>{cierre.perdidas || '—'}</Text>
                        </View>
                    </View>

                    <View style={styles.signatureRow}>
                        <View style={styles.signatureBox}>
                            {firmaSIG ? (
                                <Image src={firmaSIG} style={styles.signatureImage} />
                            ) : <View style={{ height: 50 }} />}
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureName}>SIG Combibloc</Text>
                            <Text style={styles.signatureRole}>Ingeniero de Servicio</Text>
                        </View>

                        <View style={styles.signatureBox}>
                            {firmaCliente ? (
                                <Image src={firmaCliente} style={styles.signatureImage} />
                            ) : <View style={{ height: 50 }} />}
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureName}>{datos.responsable_cliente}</Text>
                            <Text style={styles.signatureRole}>Responsable Cliente</Text>
                        </View>
                    </View>
                </View>

                {/* FIXED FOOTER */}
                <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
                    `Reporte generado el ${new Date().toLocaleDateString()} | SIG Combibloc | Pág. ${pageNumber} / ${totalPages}`
                )} />
            </Page>
        </Document>
    );
};
