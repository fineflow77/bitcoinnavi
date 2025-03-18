import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Home.tsx から借用したスタイルと色
const typography: Record<string, string> = {
    h1: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    h2: 'text-xl sm:text-2xl font-semibold tracking-tight',
    body: 'text-sm sm:text-base font-normal',
    small: 'text-xs sm:text-sm font-normal',
};

const colors: Record<string, string> = {
    cardBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
    cardBorder: 'border border-gray-700/50',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    shadowGlow: 'shadow-lg hover:shadow-xl hover:shadow-amber-500/20',
};

// Home.tsx の CHART_COLORS に合わせる
const CHART_COLORS = {
    median: '#4CAF50', // 中央価格（グリーン）
    support: '#EF4444', // 下限価格（レッド）
};

const PowerLawExplanation: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* ヘッダー */}
                    <header className="mb-12 text-center">
                        <h1
                            className={`${typography.h1} ${colors.textPrimary} mb-4 bg-clip-text bg-gradient-to-r from-blue-400 to-green-500 text-transparent`}
                        >
                            パワーロー解説
                        </h1>
                        <p className={`${typography.body} ${colors.textMuted}`}>
                            ビットコインの成長を理解するための基本的な法則
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center mt-4 text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> ホームに戻る
                        </Link>
                    </header>

                    {/* セクション: パワーローとは */}
                    <section
                        id="what-is-power-law"
                        className={`${colors.cardBg} rounded-xl p-6 mb-8 ${colors.shadowGlow} ${colors.cardBorder}`}
                    >
                        <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>
                            パワーローとは何か
                        </h2>
                        <div className={`${typography.body} ${colors.textSecondary} space-y-4`}>
                            <p>
                                パワーローとは、自然界や社会の中で見られる成長のパターンを表す法則です。この法則では、ある値が時間や規模のべき乗（累乗）に比例して増加します。ビットコインの価格も、長い期間で見るとこのパワーローに従っていると考えられています。具体的には、価格データを対数スケールでグラフにすると、直線のように見える特徴があります。
                            </p>
                            <p>
                                たとえば、地震の規模とその発生頻度、都市の人口分布、さらにはインターネット上のリンク数など、多くの現象がパワーローに従います。これらの例では、小さなものは多く、大きなものは少ないという傾向があります。ビットコインの場合も、利用者が増えるにつれて価値が急速に上がり、その成長がパワーローの形に似ているのです。
                            </p>
                            <p className={`${colors.textMuted}`}>
                                この法則が重要な理由は、ビットコインの価格が短期間で大きく変動しても、長い目で見ると一定の方向性を持っていることを示してくれるからです。これにより、将来の予測に役立つ手がかりが得られます。
                            </p>
                        </div>
                    </section>

                    {/* セクション: Santostasi の研究 */}
                    <section
                        id="santostasi"
                        className={`${colors.cardBg} rounded-xl p-6 mb-8 ${colors.shadowGlow} ${colors.cardBorder}`}
                    >
                        <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>
                            Giovanni Santostasi の研究
                        </h2>
                        <div className={`${typography.body} ${colors.textSecondary} space-y-4`}>
                            <p>
                                物理学者のジョバンニ・サントスタシは、ビットコインの価格がパワーローに従う理由を科学的に調べました。彼の研究によると、ビットコインの価格は時間とともに特定のルールに従って増加し、その軌跡が対数スケールで直線になることがわかっています。これは、価格の動きがランダムではなく、ある程度予測可能なパターンを持っていることを意味します。
                            </p>
                            <p>
                                サントスタシが考える、この成長の背景には3つの要因があります：
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>
                                    <span className="font-medium text-blue-300">自己強化フィードバック</span>
                                    ：価格が上がると注目が集まり、さらに多くの人が参加して価格が上がる仕組み。
                                </li>
                                <li>
                                    <span className="font-medium text-blue-300">難易度調整</span>
                                    ：ビットコインのマイニング（採掘）が自動で調整され、供給が安定する。
                                </li>
                                <li>
                                    <span className="font-medium text-blue-300">ネットワーク効果</span>
                                    ：使う人が増えるほど、ビットコインの価値が大きくなる。
                                </li>
                            </ul>
                            <p className={`${typography.small} ${colors.textMuted}`}>
                                サントスタシの研究は、ビットコインがただの投機的なものではなく、自然の法則に基づいた成長をしている可能性を示しています。
                            </p>
                        </div>
                    </section>

                    {/* セクション: Burger の知見 */}
                    <section
                        id="burger"
                        className={`${colors.cardBg} rounded-xl p-6 mb-8 ${colors.shadowGlow} ${colors.cardBorder}`}
                    >
                        <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>
                            HC Burger の知見
                        </h2>
                        <div className={`${typography.body} ${colors.textSecondary} space-y-4`}>
                            <p>
                                HC Burger は、パワーローを実際の投資に役立てる方法を考えました。彼は、ビットコインの価格が長期間でどのような範囲内で動くかを示す「成長回廊」という考え方を提案しています。この回廊を使うと、価格がどのあたりにいるのかがわかり、投資の判断に役立ちます。
                            </p>
                            <p>
                                Burger のモデルでは、3つの重要なラインがあります：
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>
                                    <span
                                        className="font-medium"
                                        style={{ color: CHART_COLORS.median }}
                                    >
                                        中央価格
                                    </span>
                                    ：価格が長期的にはこのあたりで安定する目安。
                                </li>
                                <li>
                                    <span
                                        className="font-medium"
                                        style={{ color: CHART_COLORS.support }}
                                    >
                                        下限価格
                                    </span>
                                    ：過去のデータでほとんど下がらないラインで、買い時と考えられる。
                                </li>
                                <li>
                                    <span className="font-medium text-blue-400">上限価格</span>
                                    ：価格が急上昇したときに到達する上限。
                                </li>
                            </ul>
                            <p className={`${typography.small} ${colors.textMuted}`}>
                                これらのラインを使うと、ビットコインの価格が今どの位置にいるのかがわかり、将来の動きを考える手助けになります。
                            </p>
                        </div>
                    </section>

                    {/* セクション: 限界と留意点 */}
                    <section
                        id="limitations"
                        className={`${colors.cardBg} rounded-xl p-6 mb-8 ${colors.shadowGlow} ${colors.cardBorder}`}
                    >
                        <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>
                            パワーローの限界と注意点
                        </h2>
                        <div className={`${typography.body} ${colors.textSecondary} space-y-4`}>
                            <p>
                                パワーローは便利な考え方ですが、完璧ではありません。使うときには、いくつかの限界を理解しておく必要があります。
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>
                                    <span className="font-medium text-yellow-300">長期的な視点</span>
                                    ：短い期間の価格の動きや市場の感情を予測するのは難しい。
                                </li>
                                <li>
                                    <span className="font-medium text-yellow-300">過去のデータに依存</span>
                                    ：新しい法律や技術の進歩など、将来の変化を予想できない。
                                </li>
                                <li>
                                    <span className="font-medium text-yellow-300">成長の限界</span>
                                    ：いつまでも急激に成長するわけではなく、どこかで落ち着く可能性がある。
                                </li>
                                <li>
                                    <span className="font-medium text-yellow-300">モデルの変化</span>
                                    ：新しい情報が入ると、パワーローの形も変わることがある。
                                </li>
                            </ul>
                            <p>
                                パワーローはあくまで一つの見方にすぎません。他の情報や分析と一緒に使うことで、より良い判断ができるようになります。
                            </p>
                        </div>
                    </section>

                    {/* セクション: 参考文献 */}
                    <section id="references" className="mt-12 pt-8 border-t border-gray-700">
                        <h2 className={`${typography.h2} ${colors.textPrimary} mb-4`}>
                            参考文献とリソース
                        </h2>
                        <div
                            className={`${colors.cardBg} rounded-xl p-6 ${colors.shadowGlow} ${colors.cardBorder} ${typography.body} ${colors.textSecondary} space-y-4`}
                        >
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="https://giovannisantostasi.medium.com/the-bitcoin-power-law-theory-962dfaf99ee9"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                    >
                                        "The Bitcoin Power Law Theory" - Giovanni Santostasi (2024)
                                    </a>
                                    <p className={`${typography.small} ${colors.textMuted} mt-1 pl-4`}>
                                        パワーローの理論的な裏付けとビットコインへの応用を物理学の視点から説明しています。
                                    </p>
                                </li>
                                <li>
                                    <a
                                        href="https://hcburger.com/blog/powerlaw/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                    >
                                        "Bitcoin's Natural Long-Term Power-Law Corridor of Growth" - HC Burger (2019)
                                    </a>
                                    <p className={`${typography.small} ${colors.textMuted} mt-1 pl-4`}>
                                        パワーローを投資に活かす具体的な方法を提案しています。
                                    </p>
                                </li>
                                <li>
                                    <a
                                        href="https://www.investopedia.com/metcalfe-s-law-5202864"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                    >
                                        "Metcalfe's Law" - Investopedia
                                    </a>
                                    <p className={`${typography.small} ${colors.textMuted} mt-1 pl-4`}>
                                        ネットワーク効果がビットコインの価値にどう影響するかを解説した入門資料です。
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PowerLawExplanation;



