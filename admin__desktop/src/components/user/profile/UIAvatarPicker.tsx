import { useAuth } from '@app/hooks/useAuth'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { Storage } from '@app/lib/firebase/storage/Storage'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import avatarPlaceholder from '@resources/img/user-placeholder.jpg'
import { updateProfile } from 'firebase/auth'
import { ImageKassiopeiaProcessingTool, ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { useEffect, useRef, useState } from 'react'
import { UIAvatar } from '../UIAvatar'

const locker = ScreenLockerKassiopeiaTool.fast

export function UIAvatarPicker() {
  const auth = useAuth()
  const [avatar, setAvatar] = useState<string>()

  const avatarInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Auth.fast.onReady(() => {
      setAvatar(Auth.fast.user?.photoURL ? Auth.fast.user.photoURL : avatarPlaceholder)
    })
  }, [])

  async function updateAvatar(file: File) {
    locker.lock()
    try {
      const blob = await ImageKassiopeiaProcessingTool.fast.convertFileToWebpBlobWithClipping(
        file,
        128,
        128,
        0.8,
      )
      if (blob) {
        const url = await Storage.fast.uploadAvatar(blob)
        if (url) {
          await updateProfile(auth.user!, { photoURL: url })
          setAvatar(url)
        }
      }
    } catch (error) {
      console.log(error)
      toasterKT.danger('Oopss... algo deu errado')
    } finally {
      locker.unlock()
    }
  }

  return (
    <div className="is-flex is-justify-content-center py-3">
      <UIAvatar
        basicTooltip="Clique para alterar seu avatar"
        linkToProfile={false}
        size={64}
        url={avatar}
        onClick={() => avatarInput.current?.click()}
      />
      <input
        type="file"
        className="is-hidden"
        ref={avatarInput}
        accept="image/jpeg, image/png, image/webp"
        onInput={(e) => {
          if (e.currentTarget.files && e.currentTarget.files[0]) updateAvatar(e.currentTarget.files[0])
        }}
      />
    </div>
  )
}
