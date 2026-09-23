// Short promotional adaptation of the supplied Unknown Number dialogue.
// Each player reply is selected; each click reveals exactly one contact bubble.
window.CASE_SCENE = {
  "sender": "Unknown Number",
  "time": "16:13",
  "opening": "You should have stayed asleep.",
  "steps": [
    {
      "choices": [
        {
          "id": "step0-0",
          "label": "Who is this?",
          "reply": "Who is this?",
          "messages": [
            {
              "from": "contact",
              "text": "Someone who didn't get to sleep through the last ten years.",
              "time": "16:13"
            }
          ]
        },
        {
          "id": "step0-1",
          "label": "Try harder than that.",
          "reply": "Try harder than that.",
          "messages": [
            {
              "from": "contact",
              "text": "You think waking up after ten years makes you untouchable? It doesn't.",
              "time": "16:13"
            }
          ]
        }
      ]
    },
    {
"choices": [
  {
    "id": "step1-0",
    "label": "If you know who did it, say it.",
    "reply": "If you know who did it, say it.",
    "messages": [
      {
        "from": "contact",
        "text": "Wrong question.",
        "time": "16:13"
      },
      {
        "from": "contact",
        "text": "You keep asking who caused the explosion.",
        "time": "16:13"
      },
      {
        "from": "contact",
        "text": "You should be asking who wasn't supposed to survive it.",
        "time": "16:14"
      },
      {
        "from": "contact",
        "text": "Someone made a mistake that night.",
        "time": "16:14"
      },

    ]
  },
  {
    "id": "step1-1",
    "label": "If you're trying to scare me, you're wasting your time.",
    "reply": "If you're trying to scare me, you're wasting your time.",
    "messages": [
      {
        "from": "contact",
        "text": "That's what everyone says before they lose something.",
        "time": "16:13"
      },
      {
        "from": "contact",
        "text": "The past was buried for a reason.",
        "time": "16:13"
      },
      {
        "from": "contact",
        "text": "Someone made sure it stayed that way for ten years.",
        "time": "16:14"
      },
      {
        "from": "contact",
        "text": "Keep reopening those graves, and more people will die.",
        "time": "16:14"
      }
    ]
  }
]
    }
  ]
};
