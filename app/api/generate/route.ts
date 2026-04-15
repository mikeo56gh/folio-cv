onFinish: async ({ text }) => {
      // Log usage event
      await supabaseAdmin.from('usage_events').insert({
        user_id: user.id,
        event: type,
        plan: userRecord?.plan || 'free',
        metadata: { seniority, sector, tone, chars: text.length },
      }).catch(console.error)
    },
