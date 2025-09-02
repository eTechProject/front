import React from "react";

const PricingSkeleton = () => {
    return (
        <section id="pricing" className="py-20 bg-zinc-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background grid elements */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
            `,
                        backgroundSize: "50px 50px",
                    }}
                ></div>
            </div>

            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
                        backgroundSize: "25px 25px",
                    }}
                ></div>
            </div>

            {/* Other decorative elements */}
            <div className="absolute top-10 left-10 w-32 h-32 border border-[#FF8C00] opacity-20 rotate-12"></div>
            <div className="absolute top-20 right-20 w-24 h-24 border border-white opacity-10 rotate-45"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 border border-[#FF8C00] opacity-15 -rotate-12"></div>
            <div className="absolute bottom-10 right-10 w-28 h-28 border border-white opacity-10 rotate-45"></div>

            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0 transform perspective-1000 rotateX-5"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255, 140, 0, 0.3) 2px, transparent 2px),
              linear-gradient(90deg, rgba(255, 140, 0, 0.3) 2px, transparent 2px)
            `,
                        backgroundSize: "100px 100px",
                    }}
                ></div>
            </div>

            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(255, 140, 0, 0.1) 35px,
                rgba(255, 140, 0, 0.1) 36px
              )
            `,
                    }}
                ></div>
            </div>

            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#FF8C00] rounded-full opacity-30"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-20"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-[#FF8C00] rounded-full opacity-25"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-20"></div>

            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-zinc-900/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="h-4 w-24 bg-zinc-700 rounded mx-auto animate-pulse"></div>
                    <div className="mt-2 h-10 w-96 bg-zinc-700 rounded mx-auto animate-pulse"></div>
                    <div className="mt-4 h-6 w-80 bg-zinc-700 rounded mx-auto animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Starter Pack Skeleton */}
                    <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 border border-zinc-700 backdrop-blur-sm">
                        <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                                    backgroundSize: "20px 20px",
                                }}
                            ></div>
                        </div>

                        <div className="h-8 w-32 bg-zinc-700 rounded animate-pulse mb-6"></div>
                        <div className="h-10 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
                        <ul className="space-y-3 mb-8">
                            <li className="h-5 w-48 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-40 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-44 bg-zinc-700 rounded animate-pulse"></li>
                        </ul>
                        <div className="h-12 w-full bg-zinc-700 rounded-full animate-pulse"></div>
                    </div>

                    {/* Professional Pack Skeleton */}
                    <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 border-2 border-[#FF8C00] transform scale-105 z-10 backdrop-blur-sm">
                        <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden">
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `
                    linear-gradient(rgba(255, 140, 0, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 140, 0, 0.2) 1px, transparent 1px)
                  `,
                                    backgroundSize: "15px 15px",
                                }}
                            ></div>
                        </div>

                        <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#FF8C00] h-6 w-20 rounded-full animate-pulse z-20"></div>
                        <div className="h-8 w-32 bg-zinc-700 rounded animate-pulse mb-6"></div>
                        <div className="h-10 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
                        <ul className="space-y-3 mb-8">
                            <li className="h-5 w-48 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-40 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-44 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-36 bg-zinc-700 rounded animate-pulse"></li>
                        </ul>
                        <div className="h-12 w-full bg-zinc-700 rounded-full animate-pulse"></div>
                    </div>

                    {/* Enterprise Pack Skeleton */}
                    <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 border border-zinc-700 backdrop-blur-sm">
                        <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                                    backgroundSize: "20px 20px",
                                }}
                            ></div>
                        </div>

                        <div className="h-8 w-32 bg-zinc-700 rounded animate-pulse mb-6"></div>
                        <div className="h-10 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
                        <ul className="space-y-3 mb-8">
                            <li className="h-5 w-48 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-40 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-44 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-36 bg-zinc-700 rounded animate-pulse"></li>
                            <li className="h-5 w-40 bg-zinc-700 rounded animate-pulse"></li>
                        </ul>
                        <div className="h-12 w-full bg-zinc-700 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSkeleton;