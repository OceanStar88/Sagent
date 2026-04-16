from dataclasses import dataclass


@dataclass
class ConversationTurn:
    user: str
    agent: str


class MockVoiceEngine:
    def build_script(self, company_name: str, system_prompt: str) -> list[ConversationTurn]:
        intro = company_name or "there"
        return [
            ConversationTurn(
                user=f"Hello, this is {intro}. Who is calling?",
                agent="Hi, this is Sagent. I am calling to introduce a faster way to handle inbound and outbound phone conversations.",
            ),
            ConversationTurn(
                user="What exactly does your platform do?",
                agent="It connects telephony, speech recognition, and an LLM so your team can automate calls while still reviewing everything in real time.",
            ),
            ConversationTurn(
                user="Can you send me more details later?",
                agent=f"Absolutely. I will mark this as interested. By the way, my speaking style is guided by this prompt: {system_prompt[:80]}",
            ),
        ]
