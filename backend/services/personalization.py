def get_profile_guidance(risk_profile: str) -> str:
    mapping = {
        'Conservative': '强调下行控制、回撤、经营韧性、分红质量和资产负债表防御性。',
        'Balanced': '在上行潜力、估值纪律、信号质量和可控波动之间保持平衡。',
        'Growth': '强调动量、扩张潜力、上行弹性，以及对更高波动的承受能力。',
    }
    return mapping.get(risk_profile, mapping['Balanced'])
